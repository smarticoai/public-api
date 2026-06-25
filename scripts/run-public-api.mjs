/* eslint-disable */
/**
 * run-public-api.mjs — run arbitrary public-API code as a REAL identified user, headless.
 *
 * A reusable test harness for verifying SDK behaviour against a live env (e.g.
 * a new server field that's only deployed on one env). It loads the real
 * smartico.js tracker bundle, init + identify as the given player, then evaluates
 * SM_CODE inside the page against `window._smartico` and prints the JSON result.
 *
 * Unlike the server-side `run_public_api` MCP tool (which runs the PUBLISHED SDK
 * in visitor mode), this runs the real browser SDK as an identified user, and can
 * reach the raw protocol via `_smartico.api.api.*` — so it surfaces server fields
 * the published transform/types don't yet map (e.g. SAW spin-expiration).
 *
 * Setup (one-time): npm i -D playwright && npx playwright install chromium
 *
 * Run the default test (SAW spin-expiration on env8 DEMO):
 *   node scripts/run-public-api.mjs
 *
 * Run your own snippet (async-function body; `_smartico` + `window._smartico_user_id` in scope):
 *   SM_CODE='return await _smartico.api.getMissions();' node scripts/run-public-api.mjs
 *   SM_CODE="$(cat my-test.js)" node scripts/run-public-api.mjs
 *
 * Point at another env/label/user:
 *   SM_LABEL=<label-key ending in env digit> SM_BRAND=<hex> SM_USER=<ext id> \
 *   SM_SALT=<label salt | 'null'> node scripts/run-public-api.mjs
 */
import { chromium } from 'playwright';
import crypto from 'crypto';

// Defaults: env8 DEMO label (SpaceX brand) with a test player that HAS expirable
// SAW spins — running bare validates SMR-48946 (mini-game spin expiration).
const LABEL = process.env.SM_LABEL || 'd78934f3-1d8b-461b-9e8f-287aae43c860-8';
const BRAND = process.env.SM_BRAND || 'c24a284e';
const USER  = process.env.SM_USER  || 'test98681514';
const SALT  = process.env.SM_SALT  || 'null';
const ORIGIN = process.env.SM_ORIGIN || 'https://app.smartico.ai/';
const SCRIPT_URL = process.env.SM_SCRIPT_URL || 'https://libs.smartico.ai/smartico.js';

// Default snippet: dump every SAW template that has spin-expiration set for this
// user, via the RAW command-700 response (the published transform drops the fields).
const DEFAULT_CODE = `
  const ext = window._smartico_user_id;
  const resp = await window._smartico.api.api.sawGetTemplates(ext);
  const list = (resp && resp.templates) || [];
  return {
    user_ext_id: ext,
    total_templates: list.length,
    templates_with_spin_expiration: list
      .filter(t => t.earliest_expiration_dt != null || t.latest_expiration_dt != null)
      .map(t => ({ saw_template_id: t.saw_template_id, spin_count: t.spin_count,
                   earliest_expiration_dt: t.earliest_expiration_dt, latest_expiration_dt: t.latest_expiration_dt })),
  };
`;
const CODE = process.env.SM_CODE || DEFAULT_CODE;

function userHash(user, salt) {
	const ts = Math.floor(Date.now() / 1000) * 1000 + 24 * 3600 * 1000;
	return crypto.createHash('md5').update(`${user.toLowerCase()}:${salt}:${ts}`.toLowerCase()).digest('hex') + ':' + ts;
}

(async () => {
	const hash = userHash(USER, SALT);
	const browser = await chromium.launch({ headless: true });
	const ctx = await browser.newContext({
		userAgent: process.env.SM_UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
		viewport: { width: 1280, height: 800 }, locale: 'en-US',
	});
	const page = await ctx.newPage();
	page.on('console', m => { if (m.type() === 'error') console.error('  [page error]', m.text().slice(0, 200)); });

	// Self-served CSP-free origin (libs.smartico.ai 403s headless + CSP-blocks injection).
	await page.route(ORIGIN + '**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head></head><body></body></html>' }));
	await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' }).catch(() => {});

	await page.evaluate((u) => new Promise((res) => {
		const s = document.createElement('script'); s.src = u; s.onload = () => res('loaded'); s.onerror = () => res('error'); document.head.appendChild(s);
	}), SCRIPT_URL);
	await page.waitForFunction(() => typeof window._smartico !== 'undefined', { timeout: 15000 });

	await page.evaluate(({ LABEL, BRAND, USER, hash }) => {
		window._smartico_user_id = USER;
		window._smartico.init(LABEL, { brand_key: BRAND });
		window._smartico.identify(USER, hash, {});
	}, { LABEL, BRAND, USER, hash });

	const ok = await page.waitForFunction(() => window._smartico?.checkSuccessfullyIdentify?.() === true, { timeout: 40000 }).then(() => true).catch(() => false);
	if (!ok) { console.error(`[run] identify failed for ${USER} on ${LABEL} (check SM_SALT / allowed origin).`); await browser.close(); process.exit(3); }
	console.error(`[run] identified ${USER} on ${LABEL} ✓`);

	// Execute the operator-supplied snippet against window._smartico. SM_CODE is
	// TRUSTED — the same trust model as `node -e`, `npx`, or the run_public_api MCP
	// tool: it is the test author's own code, not external/untrusted input. There is
	// no privilege boundary here (a "malicious SM_CODE" is the operator attacking
	// their own dev machine). Do NOT feed untrusted/remote strings into SM_CODE.
	const result = await page.evaluate(async (code) => {
		const _smartico = window._smartico; // in scope for the snippet
		try { return { ok: true, value: await (new Function('_smartico', `return (async () => { ${code} })()`))(_smartico) }; }
		catch (e) { return { ok: false, error: String(e && e.message || e) }; }
	}, CODE);

	console.log(JSON.stringify(result.ok ? result.value : { ERROR: result.error }, null, 2));
	await browser.close();
	process.exit(result.ok ? 0 : 1);
})().catch(e => { console.error('[run] fatal:', e.message); process.exit(1); });
