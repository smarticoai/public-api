#!/usr/bin/env node
/**
 * Post-process step after `typedoc` runs.
 *
 * Fixes three cosmetic issues typedoc / typedoc-plugin-markdown produce
 * that have no config flag to disable:
 *
 *   1. **"Extends" / "Extended by" blocks** on every class doc are pure
 *      inheritance-chain plumbing that consumers don't need to see. We
 *      strip them.
 *
 *   2. **Inherited methods duplicated on every subclass doc.** Each class
 *      .md re-lists every method from every ancestor in the inheritance
 *      chain (e.g. `WSAPIInbox.md` ends up with all 65+ methods even
 *      though only ~8 are its own). We detect inherited methods via the
 *      `#### Inherited from` marker typedoc emits, strip those method
 *      blocks, and leave each class doc focused on the methods that
 *      class actually declares.
 *
 *   3. **`docs/api/_media/` duplication** of UI guides. The TSDoc UI link
 *      uses a relative path `[label](../../docs/ui/<domain>/UIGuide_X.md)`
 *      which typedoc treats as a local "media" reference — it copies the
 *      file into `docs/api/_media/` and rewrites the link to point there.
 *      We delete `_media/` and rewrite the links back to the original
 *      `docs/ui/<domain>/UIGuide_X.md` so there's a single source of
 *      truth (in `docs/ui/`).
 *
 * Run via `npm run doc` (chained after typedoc) — see `package.json`.
 */
const fs = require('fs');
const path = require('path');

const DOCS_API = path.join(__dirname, '..', 'docs', 'api');
const DOCS_API_CLASSES = path.join(DOCS_API, 'classes');
const DOCS_API_MEDIA = path.join(DOCS_API, '_media');

let mdFilesProcessed = 0;
let mediaLinksRewritten = 0;
let extendsBlocksRemoved = 0;
let inheritedMethodsStripped = 0;

/** Recursively list all `.md` files under a directory. */
function walkMd(dir) {
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...walkMd(p));
		} else if (entry.isFile() && entry.name.endsWith('.md')) {
			out.push(p);
		}
	}
	return out;
}

/**
 * Strip `## Extends\n\n- [Foo](...)` and `## Extended by\n\n- [...]` sections.
 * The block ends at the next `## ` heading (or end of file).
 */
function stripExtendsBlocks(text) {
	const lines = text.split('\n');
	const out = [];
	let i = 0;
	let removed = 0;
	while (i < lines.length) {
		const ln = lines[i];
		if (ln === '## Extends' || ln === '## Extended by') {
			// Skip until the next `## ` heading or EOF
			let j = i + 1;
			while (j < lines.length && !lines[j].startsWith('## ')) {
				j++;
			}
			// Also drop one trailing blank line if present right before the
			// `## Extends` line to avoid leaving a double-blank gap.
			while (out.length > 0 && out[out.length - 1] === '') {
				out.pop();
			}
			i = j;
			removed++;
			continue;
		}
		out.push(ln);
		i++;
	}
	return { text: out.join('\n'), removed };
}

/**
 * Rewrite `(../_media/UIGuide_X.md)` → `(../../docs/ui/<domain>/UIGuide_X.md)`.
 * Domain is inferred from the filename prefix when possible; otherwise we
 * map known UI guides to their domain.
 */
const UI_GUIDE_DOMAIN = {
	UIGuide_getMissions: 'missions',
	UIGuide_getBadges: 'missions',
	UIGuide_getAchCategories: 'missions',
	UIGuide_requestMissionOptIn: 'missions',
	UIGuide_requestMissionClaimReward: 'missions',
	UIGuide_getStoreItems: 'store',
	UIGuide_buyStoreItem: 'store',
	UIGuide_getStoreCategories: 'store',
	UIGuide_getStorePurchasedItems: 'store',
};

function rewriteMediaLinks(text) {
	let count = 0;
	// Pattern: `(../_media/<filename>.md)` (when generated inside docs/api/classes/).
	// Rewrite to `(../../ui/<domain>/<filename>.md)` — correct relative from
	// `docs/api/classes/` to `docs/ui/<domain>/`. Going through `docs/` once is
	// enough; an extra `docs/` in the path would resolve to `docs/docs/ui/...`.
	const out = text.replace(/\(\.\.\/_media\/([A-Za-z0-9_]+)\.md\)/g, (m, name) => {
		const domain = UI_GUIDE_DOMAIN[name];
		if (!domain) return m; // unknown media file — leave it
		count++;
		return `(../../ui/${domain}/${name}.md)`;
	});
	return { text: out, count };
}

/**
 * Strip inherited method blocks. A method block:
 *   - Starts at `### methodName()`
 *   - Ends just before the next `### ` (next method) or `## ` (next major
 *     section), whichever comes first
 * A method is "inherited" if its block contains `#### Inherited from`.
 *
 * After stripping, the file's `## Methods` section may be empty — that's
 * OK: it means the class has no own methods (which shouldn't happen for
 * the domain classes, but is graceful for edge cases).
 */
function stripInheritedMethods(text) {
	const lines = text.split('\n');
	const out = [];
	let i = 0;
	let removed = 0;
	while (i < lines.length) {
		const ln = lines[i];
		// Detect method-block start
		if (ln.startsWith('### ')) {
			// Find block end
			let j = i + 1;
			while (
				j < lines.length &&
				!lines[j].startsWith('### ') &&
				!lines[j].startsWith('## ')
			) {
				j++;
			}
			const block = lines.slice(i, j);
			const isInherited = block.some((l) => l === '#### Inherited from');
			if (isInherited) {
				removed++;
				i = j;
				continue;
			}
			// Keep the block
			out.push(...block);
			i = j;
			continue;
		}
		out.push(ln);
		i++;
	}
	return { text: out.join('\n'), removed };
}

// 1. Process every class .md
if (fs.existsSync(DOCS_API_CLASSES)) {
	for (const file of walkMd(DOCS_API_CLASSES)) {
		const orig = fs.readFileSync(file, 'utf8');
		const a = stripExtendsBlocks(orig);
		const b = stripInheritedMethods(a.text);
		const c = rewriteMediaLinks(b.text);
		if (c.text !== orig) {
			fs.writeFileSync(file, c.text);
			mdFilesProcessed++;
			extendsBlocksRemoved += a.removed;
			inheritedMethodsStripped += b.removed;
			mediaLinksRewritten += c.count;
		}
	}
}

// 2. Delete _media/ (UI guides now linked from docs/ui/; any non-UI media
// like images would also be wiped — none expected in this project)
if (fs.existsSync(DOCS_API_MEDIA)) {
	const count = fs.readdirSync(DOCS_API_MEDIA).length;
	fs.rmSync(DOCS_API_MEDIA, { recursive: true, force: true });
	console.log(`Removed docs/api/_media/ (${count} duplicate file(s))`);
}

console.log(`Processed ${mdFilesProcessed} .md files`);
console.log(`Removed ${extendsBlocksRemoved} Extends/Extended-by block(s)`);
console.log(`Stripped ${inheritedMethodsStripped} inherited-method block(s)`);
console.log(`Rewrote ${mediaLinksRewritten} _media link(s) → docs/ui/`);
