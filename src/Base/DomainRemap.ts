const REMAP_PURPOSES = ['sdk', 'websocket', 'avatar', 'static', 'inbox', 'games_api', 'push_api', 'ide', 'brick'] as const;

export type DomainRemapPurpose = (typeof REMAP_PURPOSES)[number];

export interface DomainRemapEntry {
	purpose: DomainRemapPurpose;
	from: string;
	to: string;
}

type Rewriter = (s: string) => string;

const SMR_TO_CLOUDFRONT_DOMAINS: { [key: string]: string } = {
	'img.smr.vc': 'd1am61onjxtys8.cloudfront.net',
	'img3.smr.vc': 'd3dubbodzd2q05.cloudfront.net',
	'img4.smr.vc': 'dvm0p9vsezqr2.cloudfront.net',
	'img5.smr.vc': 'd3gen1ksvxhac8.cloudfront.net',
	'img6.smr.vc': 'db1kmyg7iufeo.cloudfront.net',
	'img7.smr.vc': 'd36om2g86xefo6.cloudfront.net',
	'img8.smr.vc': 'd2zme31v54n5pb.cloudfront.net',

	'static.smr.vc': 'dtt380pweilws.cloudfront.net',
	'static3.smr.vc': 'd1qt8ake8g4imn.cloudfront.net',
	'static4.smr.vc': 'd146b4m7rkvjkw.cloudfront.net',
	'static5.smr.vc': 'd3l7suk1kl9rwh.cloudfront.net',
	'static6.smr.vc': 'd121pfj16xdfcq.cloudfront.net',
	'static7.smr.vc': 'd21deilz814qgl.cloudfront.net',
	'static8.smr.vc': 'd1uffsroxjy2ku.cloudfront.net',
};

const REMAP_HOST_REGEX = /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SMR_DOMAIN_REGEX = new RegExp(Object.keys(SMR_TO_CLOUDFRONT_DOMAINS).map(escapeRegex).join('|'), 'g');

const buildRewriter = (pairs: string[][]): Rewriter => {
	const exact: { [host: string]: string } = {};
	const wild: string[][] = [];
	const alts: string[] = [];
	const wildAlts: string[] = [];
	pairs.forEach(([from, to]) => {
		if (from.indexOf('*.') === 0) {
			wild.push([from.substring(1), to.substring(1)]);
			wildAlts.push('[a-z0-9-]+(?:\\.[a-z0-9-]+)*' + escapeRegex(from.substring(1)));
		} else if (!(from in exact)) {
			exact[from] = to;
			alts.push(escapeRegex(from));
		}
	});
	const regex = new RegExp('(^|[^a-z0-9.-])(' + alts.concat(wildAlts).join('|') + ')(?=[/:?#"\'\\s),;<>&\\\\]|$)', 'gi');
	return (s: string) =>
		s.replace(regex, (match, pre, host) => {
			host = host.toLowerCase();
			if (host in exact) return pre + exact[host];
			for (const [from, to] of wild) {
				if (host.length > from.length && host.substring(host.length - from.length) === from) {
					return pre + host.substring(0, host.length - from.length) + to;
				}
			}
			return match;
		});
};

let remapEntries: DomainRemapEntry[] = null;
let remapForward: Rewriter = null;
let remapReverse: Rewriter = null;

const rewriteValue = <T>(value: T, rewrite: Rewriter): T => {
	if (!value) {
		return value;
	}

	const isString = typeof value === 'string';
	const source = isString ? (value as unknown as string) : JSON.stringify(value);
	const replaced = rewrite(source);

	if (replaced === source) {
		return value;
	}

	if (isString) {
		return replaced as unknown as T;
	}

	try {
		return JSON.parse(replaced);
	} catch (err) {
		return value;
	}
};

const replaceSmrHosts = (s: string): string => {
	if (remapForward) {
		s = remapForward(s);
	}
	return s.includes('smr.vc') ? s.replace(SMR_DOMAIN_REGEX, (match) => SMR_TO_CLOUDFRONT_DOMAINS[match]) : s;
};

export const replaceSmrDomains = <T>(value: T): T => rewriteValue(value, replaceSmrHosts);

export const validateDomainRemap = (entries: DomainRemapEntry[]): void => {
	if (!Array.isArray(entries)) {
		throw new Error('domains_remap: must be an array');
	}
	const seen: { [from: string]: string } = {};
	entries.forEach((e) => {
		const fail = (problem: string) => {
			throw new Error('domains_remap: ' + problem + ' in entry ' + JSON.stringify(e));
		};
		if (!e || typeof e !== 'object') fail('not an object');
		if (REMAP_PURPOSES.indexOf(e.purpose) < 0) fail('unknown purpose');
		if (typeof e.from !== 'string' || !REMAP_HOST_REGEX.test(e.from)) fail('invalid from host');
		if (typeof e.to !== 'string' || !REMAP_HOST_REGEX.test(e.to)) fail('invalid to host');
		const wildFrom = e.from.indexOf('*.') === 0;
		const wildTo = e.to.indexOf('*.') === 0;
		if ((wildFrom || wildTo) && (wildFrom !== wildTo || (e.purpose !== 'ide' && e.purpose !== 'brick'))) {
			fail('"*." needs purpose ide/brick and must be on both from and to');
		}
		if (e.from in seen && seen[e.from] !== e.to) fail('same from mapped to different to');
		seen[e.from] = e.to;
	});
	entries.forEach((e) => {
		if (e.to !== e.from && e.to in seen) throw new Error('domains_remap: to is also a from in entry ' + JSON.stringify(e));
	});
};

export const setDomainRemap = (entries?: DomainRemapEntry[] | null): void => {
	if (entries == null || (Array.isArray(entries) && !entries.length)) {
		remapEntries = remapForward = remapReverse = null;
		return;
	}
	validateDomainRemap(entries);
	const pairs = entries.map((e) => [e.from, e.to]);
	entries.forEach((e) => SMR_TO_CLOUDFRONT_DOMAINS[e.from] && pairs.push([SMR_TO_CLOUDFRONT_DOMAINS[e.from], e.to]));
	remapEntries = entries.map((e) => ({ purpose: e.purpose, from: e.from, to: e.to }));
	remapForward = buildRewriter(pairs);
	remapReverse = buildRewriter(entries.map((e) => [e.to, e.from]));
};

export const getDomainRemap = (): DomainRemapEntry[] | null => remapEntries;

export const applyDomainRemap = <T>(value: T): T => (remapForward ? rewriteValue(value, remapForward) : value);

export const reverseDomainRemap = <T>(value: T): T => (remapReverse && typeof value === 'string' ? (remapReverse(value) as unknown as T) : value);
