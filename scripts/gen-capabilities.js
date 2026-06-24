/* eslint-disable */
/**
 * gen-capabilities.js — deterministic capability-page generator.
 *
 * Stitches the existing single-source-of-truth doc inputs into one
 * self-contained "API capability page" per public WSAPI method:
 *
 *   method TSDoc (summary / @remarks contract / @param / @example / {@link})
 *   + the return TYPE's own field comments (annotate the response shape)
 *   + captured REAL response (docs/capabilities/_responses/<method>.json)
 *   ────────────────────────────────────────────────────────────────────────
 *   → docs/capabilities/<method>.md
 *
 * The capture step (run_public_api → _responses/<method>.json) is a SEPARATE
 * skill-driven step; this script is pure, deterministic assembly.
 *
 *   node scripts/gen-capabilities.js
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const WSAPI_DIR = path.join(SRC, 'WSAPI');
const OUT_DIR = path.join(ROOT, 'docs', 'capabilities');
const RESP_DIR = path.join(OUT_DIR, '_responses');

const SKIP_METHODS = new Set(['clearCaches']);

// ── helpers ────────────────────────────────────────────────────────────────

function listFiles(dir, ext, acc = []) {
	if (!fs.existsSync(dir)) return acc;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) listFiles(p, ext, acc);
		else if (e.name.endsWith(ext)) acc.push(p);
	}
	return acc;
}

const parse = (file) =>
	ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

const LINK_KINDS = new Set([
	ts.SyntaxKind.JSDocLink, ts.SyntaxKind.JSDocLinkCode, ts.SyntaxKind.JSDocLinkPlain,
]);

/** Stringify a JSDoc comment (string | NodeArray), rendering {@link X} as `X`. */
function tagText(comment) {
	if (!comment) return '';
	if (typeof comment === 'string') return comment.trim();
	return comment.map(c => {
		if (typeof c === 'string') return c;
		if (LINK_KINDS.has(c.kind)) {
			const nm = c.name ? c.name.getText() : '';
			const tail = (c.text || '').trim();
			return '`' + (nm || tail) + '`' + (nm && tail ? ' ' + tail : '');
		}
		return c.text ?? '';
	}).join('').replace(/[ \t]+/g, ' ').trim();
}

// Example-response trimming so a method returning a huge map/array (e.g.
// getTranslations → ~800 keys) doesn't dump a 900-line page. Long strings are
// clipped; arrays show 2 items; "dictionary-sized" objects (> OBJ_CAP keys, i.e.
// a key→value map rather than a struct) are truncated to a representative sample.
// Example-response trimming. NO depth collapse (the real nested shape is the point
// — e.g. gamePickGetGameInfo.sawTemplate / allRounds). Only bound the pathological
// cases: long strings, wide arrays, and dictionary-sized maps (getTranslations → 800
// keys). The full structural definition lives in the type-driven Returns section.
const EX_ARR = 1, EX_OBJ_CAP = 40, EX_OBJ_KEEP = 12;
function trimVal(v) {
	if (typeof v === 'string') return v.length > 160 ? v.slice(0, 157) + '…' : v;
	if (Array.isArray(v)) return v.slice(0, EX_ARR).map(trimVal);
	if (v && typeof v === 'object') {
		const keys = Object.keys(v);
		const capped = keys.length > EX_OBJ_CAP;
		const o = {};
		for (const k of keys.slice(0, capped ? EX_OBJ_KEEP : keys.length)) o[k] = trimVal(v[k]);
		if (capped) o['…'] = `(+${keys.length - EX_OBJ_KEEP} more keys)`;
		return o;
	}
	return v;
}

/** First capitalized type identifier in a type-text (the base of `TX[]`, `TX | null`, …). */
const baseTypeName = (txt) =>
	((txt || '').match(/[A-Z][A-Za-z0-9_]+/g) || [])
		.find(n => !['Promise', 'Partial', 'Array', 'Record', 'GamesApiResponse', 'Date'].includes(n)) || '';

// ── type registry: name → { ext:[names], fields:{ name:{comment,typeText} } } ─

function buildTypeRegistry() {
	const reg = {};
	const trailing = (sf, node) => {
		const tr = ts.getTrailingCommentRanges(sf.text, node.end) || [];
		return tr.length ? sf.text.slice(tr[0].pos, tr[0].end).replace(/^\/\/\s?/, '').trim() : '';
	};
	for (const file of listFiles(SRC, '.ts')) {
		const sf = parse(file);
		const visit = (node) => {
			if (ts.isInterfaceDeclaration(node) && node.name) {
				const name = node.name.text;
				const ext = (node.heritageClauses || [])
					.flatMap(h => h.types.map(t => baseTypeName(t.expression.getText(sf)))).filter(Boolean);
				const fields = {};
				for (const m of node.members) {
					if (!ts.isPropertySignature(m) || !m.name) continue;
					const fname = m.name.getText(sf);
					const comment = ts.getJSDocCommentsAndTags(m).map(d => tagText(d.comment)).filter(Boolean).join(' ')
						|| trailing(sf, m);
					fields[fname] = { comment: comment.replace(/\s+/g, ' ').trim(), typeText: m.type ? m.type.getText(sf) : '' };
				}
				reg[name] = { ext, fields };
			}
			ts.forEachChild(node, visit);
		};
		visit(sf);
	}
	return reg;
}

/** Merge a type's own fields over its inherited fields. */
function resolveFields(name, reg, seen = new Set()) {
	if (!name || !reg[name] || seen.has(name)) return {};
	seen.add(name);
	const acc = {};
	for (const e of reg[name].ext) Object.assign(acc, resolveFields(e, reg, seen));
	Object.assign(acc, reg[name].fields);
	return acc;
}

// ── method extraction ───────────────────────────────────────────────────────

function extractMethods() {
	const methods = [];
	for (const file of listFiles(WSAPI_DIR, '.ts')) {
		const base = path.basename(file);
		if (base === 'WSAPITypes.ts' || base === 'WSAPIBase.ts') continue;
		const domain = base.replace(/^WSAPI/, '').replace(/\.ts$/, '').toLowerCase();
		const sf = parse(file);
		const visit = (node) => {
			if (ts.isMethodDeclaration(node) && node.name) {
				const isPublic = !node.modifiers?.some(m =>
					m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword);
				const name = node.name.getText(sf);
				if (isPublic && !SKIP_METHODS.has(name) && !name.startsWith('_')) methods.push({ name, domain, node, sf });
			}
			ts.forEachChild(node, visit);
		};
		visit(sf);
	}
	return methods;
}

function readJSDoc(node, sf) {
	const docs = ts.getJSDocCommentsAndTags(node);
	const out = { description: '', remarks: '', params: [], example: '', returns: '', links: [] };
	for (const d of docs) {
		if (ts.isJSDoc(d)) out.description = tagText(d.comment) || out.description;
		for (const t of d.tags || (ts.isJSDoc(d) ? [] : [d])) {
			const tag = t.tagName?.text, txt = tagText(t.comment);
			if (tag === 'remarks') out.remarks += (out.remarks ? '\n\n' : '') + txt;
			else if (tag === 'param') out.params.push({ name: t.name?.getText(sf) ?? '', text: txt });
			else if (tag === 'example') out.example += (out.example ? '\n\n' : '') + txt;
			else if (tag === 'returns') out.returns = txt;
		}
	}
	const raw = docs.map(d => d.getText(sf)).join('\n');
	let m; const re = /\{@link\s+([A-Za-z0-9_.]+)/g;
	while ((m = re.exec(raw))) if (!out.links.includes(m[1])) out.links.push(m[1]);
	return out;
}

// ── page assembly ───────────────────────────────────────────────────────────

function splitRemarks(remarks) {
	const m = remarks.match(/\*\*Error codes[\s\S]*?(?=\n\s*\*\*[A-Z]|$)/);
	return m ? { contract: remarks.replace(m[0], '').trim(), errors: m[0].trim() } : { contract: remarks, errors: '' };
}

// Recursively render a type's fields from the registry, expanding nested object /
// array field types (bounded by depth + a per-branch cycle guard) so the full
// structure is described, not collapsed.
const RT_MAX_DEPTH = 4;
function renderType(typeName, reg, seen, depth) {
	const out = [];
	const pad = '  '.repeat(depth);
	for (const [k, info] of Object.entries(resolveFields(typeName, reg))) {
		const tt = info.typeText || '';
		out.push(`${pad}- \`${k}\` (${tt})${info.comment ? ` — ${info.comment}` : ''}`);
		const base = baseTypeName(tt);
		if (base && reg[base] && !seen.has(base) && depth < RT_MAX_DEPTH) {
			out.push(...renderType(base, reg, new Set([...seen, base]), depth + 1));
		}
	}
	return out;
}

// The full RETURN TYPE definition — unwraps Promise<…> and GamesApiResponse<…> so
// the page describes the actual payload type (e.g. GamePickGameInfo), not just the
// wrapper, with nested types expanded.
function returnsSection(ret, reg) {
	if (!ret || ret === 'void') return '_No return value._';
	let inner = ret.replace(/^Promise\s*<([\s\S]*)>\s*$/, '$1').trim();
	let prefix = '';
	const gm = inner.match(/^GamesApiResponse\s*<([\s\S]*)>\s*$/);
	if (gm) {
		prefix = 'Wrapped in `GamesApiResponse`: `errCode` (number — `0` = success), `errMessage?` (string), `data?` — the payload:\n\n';
		inner = gm[1].trim();
	}
	const isArr = /\[\]\s*$/.test(inner) || /^Array\s*</.test(inner);
	const base = baseTypeName(inner);
	if (!base || !reg[base]) return prefix + `Resolves to \`${inner}\`.`;
	const lines = [prefix + (isArr ? `Array of \`${base}\`. Each item:` : `\`${base}\`:`)];
	lines.push(...renderType(base, reg, new Set([base]), 0));
	return lines.join('\n');
}

// Renamed / shorthand / guessed names the IDE agent actually searched (from a
// 48h live-session analysis) → added to the page's Search-terms so the search
// lands first-shot. doSAWAcknowledge (8 hits) was the biggest single miss.
const ALIASES = {
	miniGameWinAcknowledgeRequest: ['doSAWAcknowledge', 'SAWAcknowledge', 'acknowledge', 'SAWAcknowledgeType'],
	getTournamentsList: ['getTournaments'],
	getTournamentInstanceInfo: ['getTournament'],
	getLeaderBoard: ['getLeaderboard', 'leaderboard'],
	getLeaderBoards: ['getLeaderboards'],
	getAvatarsList: ['getAvatars'],
	getMiniGames: ['getSAW', 'spins', 'minigames', 'wheel', 'SAWPrizeType'],
	playMiniGame: ['doSAWSpin', 'SAWSpin', 'spin'],
	playMiniGameBatch: ['doSAWSpinBatch'],
	getMiniGamesHistory: ['getSAWHistory'],
	getCurrentLevel: ['getUserLevel'],
	getLevels: ['getUserLevels'],
	getMissions: ['getUserMissions', 'achievements'],
	getBadges: ['getUserBadges'],
	getUserProfile: ['getPublicProps', 'getProfile', 'balance', 'points'],
};

/** Enum / sub-type names referenced by a return type's fields (1 level deep) —
 * so a search by a cross-cutting enum name (SAWAcknowledgeType, PointChangeSourceType,
 * GamePickResolutionType, …) lands on the page that owns it. */
function collectFieldTypeNames(typeName, reg, seen = new Set(), depth = 0) {
	const out = new Set();
	if (!typeName || depth > 1) return out;
	for (const info of Object.values(resolveFields(typeName, reg))) {
		for (const n of (info.typeText || '').match(/[A-Z][A-Za-z0-9_]+/g) || []) {
			if (n.length < 4 || ['Array', 'Record', 'Date', 'Partial', 'Promise', 'This', 'The', 'URL', 'JSON'].includes(n)) continue;
			out.add(n);
			if (reg[n] && !seen.has(n)) { seen.add(n); for (const x of collectFieldTypeNames(n, reg, seen, depth + 1)) out.add(x); }
		}
	}
	return out;
}

function buildPage(method, reg) {
	const { name, domain, node, sf } = method;
	const doc = readJSDoc(node, sf);
	const params = node.parameters.map(p => p.getText(sf)).join(', ');
	const ret = node.type ? node.type.getText(sf) : 'void';
	const typeNames = [...new Set((ret.match(/[A-Z][A-Za-z0-9_]+/g) || [])
		.filter(n => !['Promise', 'Partial', 'Array', 'Record', 'GamesApiResponse'].includes(n)))];
	const typeName = typeNames[0] || '';
	const summary = (doc.description.split(/(?<=[.!?])\s/)[0] || doc.description || name).replace(/\s+/g, ' ').trim();

	const respPath = path.join(RESP_DIR, `${name}.json`);
	const respJson = fs.existsSync(respPath) ? JSON.parse(fs.readFileSync(respPath, 'utf8')) : null;
	const { contract, errors } = splitRemarks(doc.remarks);

	const sampleKeys = respJson ? Object.keys((Array.isArray(respJson) ? respJson[0] : respJson) || {}).slice(0, 8) : [];
	const onUpd = /\bonUpdate\b/.test(params) ? ['onUpdate', 'subscription'] : [];
	const fieldTypes = [...collectFieldTypeNames(typeName, reg)].slice(0, 12);
	const searchTerms = [name, domain, ...(ALIASES[name] || []), ...typeNames, ...fieldTypes, ...onUpd, ...sampleKeys]
		.filter((v, i, a) => v && a.indexOf(v) === i).join(', ');

	const o = [];
	o.push(`# ${name} — API${typeName ? ` (${typeName})` : ''}`, '');
	o.push(`> ${summary}`);
	o.push(`> Import: \`import { ${typeNames.join(', ') || '/* types */'} } from '@smartico/public-api'\``);
	o.push(`> Search terms: ${searchTerms}`, '');
	o.push('## Signature', '```ts', `_smartico.api.${name}(${params}): ${ret}`, '```', '');
	o.push('## Parameters', doc.params.length
		? doc.params.map(p => `- ${p.name ? `\`${p.name}\` — ` : ''}${p.text}`.replace(/\s+/g, ' ').trim()).join('\n')
		: '_None._', '');
	o.push(`## Returns${typeName ? ` — \`${ret}\`` : ''}`, returnsSection(ret, reg), '');
	o.push('## Behavioral contract', contract || `See the [UI guide](../ui/${domain}/UIGuide_${name}.md) if present.`, '');
	if (doc.example) o.push('## Example', doc.example.trim(), '');
	if (respJson) o.push('### Example response (REAL shape)', '```json',
		JSON.stringify(Array.isArray(respJson) ? [trimVal(respJson[0])] : trimVal(respJson), null, 2), '```', '');
	o.push('## Errors', errors || "See this method's TSDoc / the mutation pages for `err_code` handling.", '');
	if (doc.links.length) o.push('## Related', doc.links.filter(l => l !== name).map(l => `- \`${l}\``).join('\n'), '');
	return o.join('\n');
}

// ── global `_smartico.*` surface + callbacks (non-.api.* — the live-session
//    analysis showed these were unreachable in the `api` lane and live-probed) ──

function buildGlobalSurfacePage() {
	const file = path.join(SRC, 'SmarticoGlobal.ts');
	if (!fs.existsSync(file)) return null;
	const sf = parse(file);
	let iface = null;
	const find = (n) => { if (ts.isInterfaceDeclaration(n) && n.name.text === 'SmarticoGlobal') iface = n; ts.forEachChild(n, find); };
	find(sf);
	if (!iface) return null;
	const members = iface.members.filter(m => m.name).map(m => ({
		name: m.name.getText(sf),
		sig: m.getText(sf).replace(/;$/, '').replace(/\s+/g, ' ').trim(),
		one: ts.getJSDocCommentsAndTags(m).map(d => tagText(d.comment)).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
	}));
	const extra = ['_smartico', 'global', 'window._smartico', 'SmarticoGlobal', 'visitor mode', 'callbacks', 'events',
		'onWin', 'onReady', 'deep link', 'getWidgetParams', 'IWidgetParams', 'widget params', 'readiness', 'lifecycle', 'push'];
	const terms = [...new Set([...members.map(m => m.name), ...extra])].join(', ');
	const o = [];
	o.push('# _smartico — global SDK surface (non-`.api.*`)', '');
	o.push('> The `window._smartico` control surface: init/identify, events, deep links, widgets, visitor-mode `vapi`, push, and utilities — everything that is NOT `_smartico.api.*` (those have their own capability pages).');
	o.push("> Import: typed via `SmarticoGlobal` from '@smartico/public-api'; at runtime the object is on `window._smartico` (no import).");
	o.push(`> Search terms: ${terms}`, '');
	o.push('## Readiness gate', 'Call `window._smartico?.checkSuccessfullyIdentify()` (synchronous) before any `_smartico.api.*` — `true` once init + identify completed. Or subscribe `_smartico.on(\'identify\', cb)` (see the callbacks page).', '');
	o.push('## Methods');
	for (const m of members) o.push(`- \`_smartico.${m.sig}\`${m.one ? ` — ${m.one}` : ''}`);
	o.push('');
	o.push('## Visitor mode (`vapi`)', '`_smartico.vapi(language)` returns a `WSAPI` scoped to anonymous visitors — same method shapes as `_smartico.api.*`, for unidentified users (pre-login surfaces).', '');
	o.push('## Reading widget params', 'A widget embedded via `showWidget` / `miniGame` receives `IWidgetParams` (theme, height, inline, …). Read them from the embedding snippet / `window.__SMARTICO_LP_PARAMS__`, not from an API call.', '');
	o.push('## Related', '- `_smartico.on — events & callbacks` (the callbacks capability page)', '- Full prose reference: the SmarticoObject doc (search source `api-raw`).');
	return o.join('\n');
}

function buildConceptPage(srcRel, title, terms) {
	const p = path.join(ROOT, srcRel);
	if (!fs.existsSync(p)) return null;
	const body = fs.readFileSync(p, 'utf8').replace(/^#\s+.*\r?\n/, '').trim();
	return [`# ${title}`, '', `> ${title}.`, `> Search terms: ${terms}`, '', body].join('\n');
}

function main() {
	if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
	const reg = buildTypeRegistry();
	const methods = extractMethods();
	let written = 0, withResp = 0;
	for (const method of methods) {
		fs.writeFileSync(path.join(OUT_DIR, `${method.name}.md`), buildPage(method, reg));
		written++;
		if (fs.existsSync(path.join(RESP_DIR, `${method.name}.json`))) withResp++;
	}
	let extra = 0;
	const g = buildGlobalSurfacePage();
	if (g) { fs.writeFileSync(path.join(OUT_DIR, 'smarticoGlobal.md'), g); extra++; }
	const cb = buildConceptPage('docs/Callbacks.md', '_smartico.on — events & callbacks',
		'on, off, callbacks, events, subscribe, subscribeUpdate, onWin, onReady, props_change, identify, EXTERNAL_CALLBACK, lifecycle, _smartico.on');
	if (cb) { fs.writeFileSync(path.join(OUT_DIR, 'smarticoCallbacks.md'), cb); extra++; }
	console.log(`[gen-capabilities] wrote ${written} method pages + ${extra} global/concept pages (${withResp} with captured response); type registry: ${Object.keys(reg).length} interfaces`);
}

main();
