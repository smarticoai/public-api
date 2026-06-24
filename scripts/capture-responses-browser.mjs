/* eslint-disable */
/**
 * capture-responses-browser.mjs — REAL-USER response-shape capture (headless).
 *
 * Loads the real Smartico tracker bundle (smartico.js) in a headless browser,
 * does `init` + `identify` as an actual identified player, then calls every
 * `_smartico.api.*` GET method and writes one anonymized sample per method to
 * `docs/capabilities/_responses/<method>.json` (the generator inputs for
 * gen-capabilities.js).
 *
 * Why a browser (vs the server-side `run_public_api`): methods that read tracker
 * state — `getUserProfile`, `getInboxMessageBody` — and the auth-only GamePick
 * methods are NOT available in the server's visitor mode. Real identify fills
 * those gaps and gives shapes identical to what a browser consumer sees.
 *
 * Setup + run:
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/capture-responses-browser.mjs
 *
 * Creds default to the env4 ICE test label (salt_key 'null' → the user-hash is
 * computable client-side; no server secret needed). Override via env:
 *   SM_LABEL, SM_BRAND, SM_USER, SM_SALT, SM_SCRIPT_URL
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESP_DIR = path.join(__dirname, '..', 'docs', 'capabilities', '_responses');

const LABEL = process.env.SM_LABEL || 'a6e7ac26-c368-4892-9380-96e7ff82cf3e-4';
const BRAND = process.env.SM_BRAND || 'f86271e6';
const USER  = process.env.SM_USER  || '4579cace-9069-4d65-93ff-9b8b6c83c45b';
const SALT  = process.env.SM_SALT  || 'null';
const SCRIPT_URL = process.env.SM_SCRIPT_URL || 'https://libs.smartico.ai/smartico.js';

// hash = md5(lower(`user:salt:ts`)) + ':' + ts ; ts = now + 24h, ms (matches the
// tracker's expo/public/index.html harness exactly).
function userHash(user, salt) {
	const ts = Math.floor(Date.now() / 1000) * 1000 + 24 * 3600 * 1000;
	const input = `${user.toLowerCase()}:${salt}:${ts}`.toLowerCase();
	return crypto.createHash('md5').update(input).digest('hex') + ':' + ts;
}

const anon = (v) => {
	if (typeof v === 'string') return v
		.replace(/https?:\/\/[a-z0-9.\-]+\.(cloudfront\.net|smartico\.ai|smrcdn\.cloud|smr\.vc)/gi, 'https://cdn.example')
		.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '00000000-0000-0000-0000-000000000000');
	if (Array.isArray(v)) return v.map(anon);
	if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = (k === 'clean_ext_user_id') ? '0' : anon(v[k]); return o; }
	return v;
};

(async () => {
	const LOG = '/tmp/sm-capture.log';
	const log = (m) => { const line = '[capture] ' + m; console.log(line); try { fs.appendFileSync(LOG, line + '\n'); } catch {} };
	try { fs.writeFileSync(LOG, ''); } catch {}
	const DEBUG = !!process.env.SM_DEBUG; // SM_DEBUG=1 → full console + per-frame WS trace
	const nodeTimeout = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('node-timeout ' + ms + 'ms @ ' + label)), ms))]);

	const hash = userHash(USER, SALT);
	log('launching chromium…');
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		userAgent: process.env.SM_UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
		viewport: { width: 1280, height: 800 }, locale: 'en-US',
	});
	const page = await context.newPage();
	page.on('console', m => { if (DEBUG || ['error', 'warning'].includes(m.type())) log('  [console:' + m.type() + '] ' + m.text().slice(0, 260)); });
	page.on('requestfailed', r => log('  [requestfailed] ' + r.url().slice(0, 120) + ' — ' + (r.failure()?.errorText || '')));
	page.on('pageerror', e => log('  [pageerror] ' + String(e.message || e).slice(0, 240)));
	let wsFrames = 0;
	page.on('websocket', ws => {
		log('  [ws OPEN] ' + ws.url().slice(0, 140));
		ws.on('socketerror', e => log('  [ws ERROR] ' + String(e).slice(0, 200)));
		ws.on('close', () => log('  [ws CLOSE] ' + ws.url().slice(0, 80)));
		ws.on('framesent', f => { if (DEBUG && wsFrames++ < 40) log('  [ws →] ' + String(f.payload).slice(0, 160)); });
		ws.on('framereceived', f => { if (DEBUG && wsFrames++ < 40) log('  [ws ←] ' + String(f.payload).slice(0, 160)); });
	});

	// Serve a blank, CSP-free page on a stable https origin. libs.smartico.ai 403s
	// the headless client and its error page carries a CSP that blocks injected
	// scripts; a self-served origin sidesteps both. smartico.js is still fetched
	// over the real network with the realistic UA above. Override origin via SM_ORIGIN.
	const ORIGIN = process.env.SM_ORIGIN || 'https://app.smartico.ai/';
	await page.route(ORIGIN + '**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head></head><body></body></html>' }));
	log('goto sandbox origin ' + ORIGIN + ' …');
	await nodeTimeout(page.goto(ORIGIN, { waitUntil: 'domcontentloaded' }), 20000, 'goto').catch(e => log('goto: ' + e.message));

	log('injecting smartico.js …');
	const loadState = await nodeTimeout(page.evaluate((SCRIPT_URL) => new Promise((resolve) => {
		window._smartico_script_location = SCRIPT_URL;
		const s = document.createElement('script');
		s.src = SCRIPT_URL;
		s.onload = () => resolve('loaded');
		s.onerror = () => resolve('error');
		document.head.appendChild(s);
	}), SCRIPT_URL), 25000, 'inject').catch(e => 'timeout:' + e.message);
	log('smartico.js → ' + loadState);

	await page.waitForFunction(() => typeof window._smartico !== 'undefined', { timeout: 10000 }).catch(() => {});
	log('init + identify …');
	const idDiag = await page.evaluate(({ LABEL, BRAND, USER, hash }) => {
		if (typeof window._smartico === 'undefined') return { reason: 'no _smartico' };
		const t = { smartico: typeof window._smartico, identify: typeof window._smartico.identify, api: typeof window._smartico.api };
		try {
			window._smartico_user_id = USER;
			window._smartico_user_hash = hash;
			window._smartico.init(LABEL, { brand_key: BRAND, debug: true });
			if (typeof window._smartico.identify === 'function') { window._smartico.identify(USER, hash, {}); t.call = 'identify()'; }
			else { window._smartico('identify', USER, hash, {}); t.call = 'queue'; }
		} catch (e) { t.error = e.message; }
		return t;
	}, { LABEL, BRAND, USER, hash }).catch(e => ({ evalError: e.message }));
	log('identify diag: ' + JSON.stringify(idDiag));

	const identified = await page.waitForFunction(() => window._smartico?.checkSuccessfullyIdentify?.() === true, { timeout: 35000 })
		.then(() => true).catch(() => false);
	log(identified ? 'identified ✓ — calling api methods' : 'NOT identified (timeout) — calling anyway (auth methods will error)');
	if (await page.evaluate(() => typeof window._smartico) === 'undefined') { log('FATAL: _smartico never loaded (smartico.js blocked). Run from an allowed origin/network.'); await browser.close(); process.exit(2); }
	if (!identified) {
		log('identify did not complete — skipping the api sweep (auth-only methods need a live identified session).');
		log('likely cause: WS backend unreachable from here, origin not allowlisted for the label, or hash/salt rejected. Run from an allowed origin/network, or set SM_SALT / a precomputed hash.');
		await browser.close();
		process.exit(3);
	}

	const results = await nodeTimeout(page.evaluate(async ({ MUTATE }) => {
		const api = window._smartico.api;
		const clip = (v) => {
			if (typeof v === 'string') return v.length > 200 ? v.slice(0, 197) + '…' : v;
			if (Array.isArray(v)) return v.map(clip);
			if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = clip(v[k]); return o; }
			return v;
		};
		// "richness" = count of populated (non-null/non-empty) fields — pick the most
		// complete item so the captured shape isn't a degenerate first element.
		const score = (o) => (o && typeof o === 'object' && !Array.isArray(o))
			? Object.values(o).filter(v => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)).length : 0;
		const rich = (arr, n = 2) => Array.isArray(arr) ? arr.slice().sort((a, b) => score(b) - score(a)).slice(0, n).map(clip) : clip(arr);
		const one = (r) => clip(Array.isArray(r) ? r.slice(0, 1) : r);
		const out = {};
		const withTimeout = (p, ms = 8000) => Promise.race([
			Promise.resolve().then(() => p),
			new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + ms + 'ms')), ms)),
		]);
		const safe = async (n, fn, post) => { try { const r = await withTimeout(Promise.resolve().then(fn)); out[n] = (post || (Array.isArray(r) ? rich : clip))(r); } catch (e) { out[n] = 'ERR: ' + (e && e.message || String(e)); } };
		const raw = async (fn) => { try { return await withTimeout(Promise.resolve().then(fn)); } catch (e) { return null; } };
		const now = Math.floor(Date.now() / 1000);

		// ---- profile (tracker-state, browser-only) ----
		try { out.getUserProfile = clip(api.getUserProfile()); } catch (e) { out.getUserProfile = 'ERR: ' + e.message; }

		// ---- list fetches (raw kept for id-harvesting; richest sample stored) ----
		const missions = await raw(() => api.getMissions()); out.getMissions = rich(missions);
		const badges = await raw(() => api.getBadges()); out.getBadges = rich(badges);
		await safe('getAchCategories', () => api.getAchCategories());
		const bonuses = await raw(() => api.getBonuses()); out.getBonuses = rich(bonuses);
		const store = await raw(() => api.getStoreItems()); out.getStoreItems = rich(store);
		await safe('getStoreCategories', () => api.getStoreCategories());
		await safe('getStorePurchasedItems', () => api.getStorePurchasedItems({ limit: 3 }));
		const tours = await raw(() => api.getTournamentsList()); out.getTournamentsList = rich(tours);
		const clans = await raw(() => api.getClans()); out.getClans = clip(clans);
		const jackpot = await raw(() => api.jackpotGet()); out.jackpotGet = clip(jackpot);
		const raffles = await raw(() => api.getRaffles()); out.getRaffles = rich(raffles);
		const minigames = await raw(() => api.getMiniGames()); out.getMiniGames = rich(minigames);
		await safe('getMiniGamesHistory', () => api.getMiniGamesHistory({ limit: 3 }));
		const avatars = await raw(() => api.getAvatarsList()); out.getAvatarsList = rich(avatars);
		await safe('getAvatarsCustomized', () => api.getAvatarsCustomized());
		await safe('getAvatarPrompts', () => api.getAvatarPrompts());
		const inbox = await raw(() => api.getInboxMessages()); out.getInboxMessages = rich(inbox);
		await safe('getInboxUnreadCount', () => api.getInboxUnreadCount(), clip);
		await safe('getCustomSections', () => api.getCustomSections());
		await safe('getTranslations', () => api.getTranslations('EN'), clip);
		await safe('getCurrentLevel', () => api.getCurrentLevel(), clip);
		await safe('getLevels', () => api.getLevels());
		await safe('getUserLevelExtraCounters', () => api.getUserLevelExtraCounters(), clip);
		await safe('getActivityLog', () => api.getActivityLog({ startTimeSeconds: now - 2592000, endTimeSeconds: now, from: 0, to: 20 }));

		// ---- detail / param methods — every id harvested from the lists above (no hardcodes) ----
		const ids = {};
		ids.tournamentInstance = tours?.[0]?.instance_id;
		if (ids.tournamentInstance != null) out.getTournamentInstanceInfo = clip(await raw(() => api.getTournamentInstanceInfo(ids.tournamentInstance)));
		ids.clanId = clans?.clans?.[0]?.clan_id;
		if (ids.clanId != null) out.getClanInfo = clip(await raw(() => api.getClanInfo(ids.clanId)));
		ids.jpTemplate = Array.isArray(jackpot) ? jackpot?.[0]?.jp_template_id : jackpot?.jp_template_id;
		if (ids.jpTemplate != null) {
			await safe('getJackpotWinners', () => api.getJackpotWinners({ jp_template_id: ids.jpTemplate }));
			await safe('getJackpotEligibleGames', () => api.getJackpotEligibleGames({ jp_template_id: ids.jpTemplate }));
		}
		ids.inboxGuid = inbox?.[0]?.message_guid;
		if (ids.inboxGuid) await safe('getInboxMessageBody', () => api.getInboxMessageBody(ids.inboxGuid), clip);
		const raffle0 = raffles?.[0]; const draw0 = raffle0?.draws?.[0];
		if (raffle0 && draw0) {
			await safe('getRaffleDrawRun', () => api.getRaffleDrawRun({ raffle_id: raffle0.id, run_id: draw0.run_id }), clip);
			await safe('getRaffleDrawRunsHistory', () => api.getRaffleDrawRunsHistory({ raffle_id: raffle0.id }));
		}
		await safe('getLeaderBoard', () => api.getLeaderBoard(1), clip);

		// ---- GamePick: find a usable MatchX/Quiz template from the minigame list ----
		const gpGames = (minigames || []).filter(g => g.saw_game_type === 'matchx' || g.saw_game_type === 'quiz');
		for (const g of gpGames) {
			const info = await raw(() => api.gamePickGetGameInfo({ saw_template_id: g.id }));
			if (info && info.errCode === 0) {
				out.gamePickGetGameInfo = clip(info);
				const rounds = await raw(() => api.gamePickGetActiveRounds({ saw_template_id: g.id }));
				out.gamePickGetActiveRounds = one(rounds);
				const roundId = rounds?.data?.[0]?.round_id;
				ids.gpTemplate = g.id; ids.gpRound = roundId;
				if (roundId) {
					out.gamePickGetActiveRound = one(await raw(() => api.gamePickGetActiveRound({ saw_template_id: g.id, round_id: roundId })));
					out.gamePickGetBoard = one(await raw(() => api.gamePickGetBoard({ saw_template_id: g.id, round_id: roundId })));
				}
				out.gamePickGetHistory = one(await raw(() => api.gamePickGetHistory({ saw_template_id: g.id })));
				out.gamePickGetUserInfo = one(await raw(() => api.gamePickGetUserInfo({ saw_template_id: g.id })));
				break;
			}
		}

		if (!MUTATE) return out;

		// =================== MUTATIONS (opt-in via SM_MUTATIONS=1) ===================
		// TEST ACCOUNT ONLY. Reversible mutations are restored; one-shot/consuming ones
		// (claim/buy/register/play) intentionally change state to capture the result shape.
		const prof = (() => { try { return api.getUserProfile() || {}; } catch { return {}; } })();

		if (ids.jpTemplate != null) { // jackpot opt in → out (net opted-out)
			await safe('jackpotOptIn', () => api.jackpotOptIn({ jp_template_id: ids.jpTemplate }), clip);
			await safe('jackpotOptOut', () => api.jackpotOptOut({ jp_template_id: ids.jpTemplate }), clip);
		}
		if (ids.inboxGuid) { // inbox mark read + favorite toggle (favorite restored)
			await safe('markInboxMessageAsRead', () => api.markInboxMessageAsRead(ids.inboxGuid), clip);
			await safe('markUnmarkInboxMessageAsFavorite', () => api.markUnmarkInboxMessageAsFavorite(ids.inboxGuid, true), clip);
			await raw(() => api.markUnmarkInboxMessageAsFavorite(ids.inboxGuid, false));
			await safe('markAllInboxMessagesAsRead', () => api.markAllInboxMessagesAsRead(), clip);
		}
		const av = (avatars || [])[0]; // setAvatar (restore original)
		const newUrl = av?.avatar_url || av?.public_meta?.image_url;
		const newReal = av?.avatar_real_id ?? av?.id;
		if (newUrl && newReal != null) {
			await safe('setAvatar', () => api.setAvatar({ avatar_url: newUrl, avatar_real_id: newReal }), clip);
			if (prof.avatar_url && prof.avatar_real_id != null) await raw(() => api.setAvatar({ avatar_url: prof.avatar_url, avatar_real_id: prof.avatar_real_id }));
		}
		const optMission = (missions || []).find(m => m.is_requires_optin && !m.is_opted_in && !m.is_locked);
		if (optMission) await safe('requestMissionOptIn', () => api.requestMissionOptIn(optMission.id), clip);
		const claimMission = (missions || []).find(m => m.requires_prize_claim && m.ach_completed_id);
		if (claimMission) await safe('requestMissionClaimReward', () => api.requestMissionClaimReward(claimMission.id, claimMission.ach_completed_id), clip);
		let rOpt = null; // raffle opt-in (a draw that requires it, not yet opted-in)
		for (const rf of (raffles || [])) { const d = (rf.draws || []).find(d => d.requires_optin && !d.user_opted_in && d.is_active); if (d) { rOpt = { raffle_id: rf.id, draw_id: d.id, raffle_run_id: d.run_id }; break; } }
		if (rOpt) await safe('requestRaffleOptin', () => api.requestRaffleOptin(rOpt), clip);
		const bonus = (bonuses || []).find(b => b.is_redeemable ?? b.redeemable) || (bonuses || [])[0];
		if (bonus) await safe('claimBonus', () => api.claimBonus(bonus.id), clip); // consumes a bonus
		const regT = (tours || []).find(t => t.is_can_register) || (tours || [])[0];
		if (regT) await safe('registerInTournament', () => api.registerInTournament(regT.instance_id), clip); // success or insufficient-funds shape
		const buyItem = (store || []).filter(s => s.purchase_type === 'points').sort((a, b) => (a.price || 0) - (b.price || 0))[0] || (store || [])[0];
		if (buyItem) await safe('buyStoreItem', () => api.buyStoreItem(buyItem.id), clip); // success or insufficient-balance shape
		const myClan = prof.core_clan_id ? Number(prof.core_clan_id) : null;
		if (myClan) await safe('joinClan', () => api.joinClan(myClan), clip); // re-join current clan = harmless, still returns the shape
		const freeGame = (minigames || []).find(g => g.saw_buyin_type === 'free' && Number(g.spin_count) !== 0) || (minigames || []).find(g => g.saw_buyin_type === 'free');
		if (freeGame) { // play a FREE minigame (no currency) without auto-ack, then acknowledge
			const play = await raw(() => api.playMiniGame(freeGame.id, { acknowledge: false }));
			if (play) out.playMiniGame = clip(play);
			if (play && play.request_id) await safe('miniGameWinAcknowledgeRequest', () => api.miniGameWinAcknowledgeRequest(play.request_id), clip);
			await safe('playMiniGameBatch', () => api.playMiniGameBatch(freeGame.id, 1), clip);
		}

		return out;
	}, { MUTATE: !!process.env.SM_MUTATIONS }), 240000, 'sweep');

	let ok = 0, skip = [];
	for (const [name, val] of Object.entries(results)) {
		if (typeof val === 'string' && val.startsWith('ERR')) { skip.push(`${name}: ${val.slice(0, 70)}`); continue; }
		fs.writeFileSync(path.join(RESP_DIR, `${name}.json`), JSON.stringify(anon(val), null, 2));
		ok++;
	}
	log(`wrote ${ok} response files`);
	if (skip.length) log('skipped (errors):\n  ' + skip.join('\n  '));
	log('now run: npm run gen-capabilities');
	await browser.close();
})().catch(e => { try { fs.appendFileSync('/tmp/sm-capture.log', '[capture] fatal: ' + e.message + '\n'); } catch {} console.error('[capture] fatal:', e.message); process.exit(1); });
