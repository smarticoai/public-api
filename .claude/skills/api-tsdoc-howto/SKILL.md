---
name: api-tsdoc-howto
description: Inspect the Smartico public-api working tree (uncommitted changes + recent commits), determine which docs / capability pages / captured responses are now stale, and output the EXACT ordered commands to bring the docs + RAG pipeline back in sync. Read-only — never edits, never runs the build/capture/commit steps itself. Use when the user types /api-tsdoc-howto, or asks "what docs need updating", "how do I sync the SDK docs", "what's stale", "what do I run to finish the docs".
---

# api-tsdoc-howto

A **read-only diagnostic** for the `@smartico/public-api` docs + RAG pipeline.
It looks at what changed (uncommitted + recent commits), works out what is now
out of date, and prints a **copy-pasteable, ordered command plan** to complete
the full flow. It does NOT make edits or run any build/capture/commit step — it
tells the human exactly what to run.

Full background: `/Users/aa/Desktop/SM/public-api/readme-smartico-dev.md`.

## Hard rules

- **Read-only.** Only run inspection commands (`git status`, `git diff`,
  `git log`, `ls`, `grep`, `node -e` for counting). NEVER run
  `npm run gen-capabilities`, `npm run doc`, the capture scripts,
  `git commit`, `npm publish`, or `bump-tracker`. NEVER edit files.
- **Output = a plan, not actions.** End with an ordered list of exact commands
  the human runs, plus a one-paragraph "what's stale and why".
- Work in `/Users/aa/Desktop/SM/public-api` (the `PUB` dir below).

## The pipeline (what feeds what)

```
SOURCE (edit)                                  → REGEN STEP            → ARTIFACT (don't edit)
src/WSAPI/WSAPI<Domain>.ts (method TSDoc)       ┐
src/WSAPI/WSAPITypes.ts + src/<Domain>/*.ts     ├ npm run gen-capabilities → docs/capabilities/<method>.md
docs/ui/<domain>/UIGuide_<method>.md            │
docs/capabilities/_responses/<method>.json      ┘
src/**.ts (TSDoc) + tsconfig entryPoints        → npm run doc              → docs/api/**
docs/capabilities/**                            → JobLLM2 (env2 cron, auto) → RAG (PUBLIC_API_CAPABILITY)
```

## Step 1 — gather state

```sh
PUB=/Users/aa/Desktop/SM/public-api
git -C "$PUB" status --porcelain
git -C "$PUB" --no-pager diff --stat HEAD
git -C "$PUB" --no-pager log --oneline -10
# coverage
echo "pages: $(ls "$PUB"/docs/capabilities/*.md 2>/dev/null | wc -l | tr -d ' ') | responses: $(ls "$PUB"/docs/capabilities/_responses/*.json 2>/dev/null | wc -l | tr -d ' ')"
```

Consider BOTH uncommitted changes and the last few commits — a method enriched
in a recent commit may still be missing its regenerated page or captured
response if the author stopped early.

## Step 2 — classify each changed path → impact

| Changed path | What it means | Needs |
|---|---|---|
| `src/WSAPI/WSAPI<Domain>.ts` | method TSDoc/signature/return changed | `gen-capabilities`; `doc` |
| `src/WSAPI/WSAPITypes.ts`, `src/<Domain>/*.ts` (types) | field shapes/comments changed | `gen-capabilities`; `doc`; maybe **re-capture** if the wire shape changed |
| `docs/ui/<domain>/UIGuide_<method>.md` | behavioral contract changed | `gen-capabilities` |
| `docs/capabilities/_responses/<method>.json` | new/updated real response | `gen-capabilities` |
| `scripts/gen-capabilities.js` | generator logic changed | `gen-capabilities` (all pages) |
| `tsconfig.json` (`entryPoints`/`projectDocuments`) | new public type/doc | `doc` |
| **`docs/capabilities/*.md`** edited by hand | ⚠️ generated file hand-edited | WARN — will be overwritten; move the change to the source + regenerate |
| **`docs/api/**`** edited by hand | ⚠️ TypeDoc output hand-edited | WARN — overwritten by `doc` |
| a **new public method** in `WSAPI<Domain>.ts` | brand-new surface | full flow: TSDoc → capture → `gen-capabilities` → entryPoints/`doc` |

## Step 3 — concrete staleness checks (run these)

```sh
PUB=/Users/aa/Desktop/SM/public-api

# (a) Inputs changed but capability pages NOT regenerated → pages are STALE.
#     If any of these appear in `git status` while docs/capabilities/*.md do NOT,
#     gen-capabilities must run.
git -C "$PUB" status --porcelain -- src/WSAPI docs/ui docs/capabilities/_responses scripts/gen-capabilities.js
git -C "$PUB" status --porcelain -- docs/capabilities/'*.md'   # empty here = not yet regenerated

# (b) Public methods with NO capability page (new methods) or NO captured response.
node -e '
const fs=require("fs"),path=require("path");
const W=path.join("'"$PUB"'","src/WSAPI"), C=path.join("'"$PUB"'","docs/capabilities"), R=path.join(C,"_responses");
const methods=new Set();
for(const f of fs.readdirSync(W)){ if(!/^WSAPI.*\.ts$/.test(f)||f==="WSAPITypes.ts"||f==="WSAPIBase.ts")continue;
  for(const m of fs.readFileSync(path.join(W,f),"utf8").matchAll(/^\tpublic (?:async )?([a-zA-Z][A-Za-z0-9]*)\s*[(<]/gm)) methods.add(m[1]); }
const pages=new Set(fs.existsSync(C)?fs.readdirSync(C).filter(f=>f.endsWith(".md")).map(f=>f.slice(0,-3)):[]);
const resp=new Set(fs.existsSync(R)?fs.readdirSync(R).filter(f=>f.endsWith(".json")).map(f=>f.slice(0,-5)):[]);
const noPage=[...methods].filter(m=>!pages.has(m));
const noResp=[...methods].filter(m=>!resp.has(m));
console.log("methods:",methods.size,"| no capability page:",noPage.join(", ")||"none","| no captured response:",noResp.join(", ")||"none");
'

# (c) New exported public types not yet in TypeDoc entryPoints.
grep -oE "export (interface|class|enum|type) [A-Z][A-Za-z0-9_]+" "$PUB"/src/WSAPI/WSAPITypes.ts | awk '{print $3}' | sort -u > /tmp/_types.txt
node -e 'const o=require("'"$PUB"'/tsconfig.json");console.log("entryPoints:",(o.typedocOptions.entryPoints||[]).join(" "))'
```

Interpretation:
- **(a)** source/ui/response changed AND `docs/capabilities/*.md` unchanged → **run gen-capabilities**.
- **(b)** `no capability page` → a new method; needs TSDoc + capture + gen. `no captured response` → page exists but only type-fallback Returns (no real example) → capture if reachable.
- **(c)** a new public type referenced by a method but absent from `entryPoints`/`docs/api` → add it + run `doc`.

## Step 4 — emit the ordered command plan

Print ONLY the steps that apply, in order. Template:

```
Docs sync plan (run from /Users/aa/Desktop/SM/public-api):

# 1. capture real responses (only if new/changed methods need a real example)
#    visitor-reachable methods — fastest, no browser:
#      use the mcp__hive__run_public_api tool (see readme §4a)
#    auth-only (getUserProfile / gamePick* / getInboxMessageBody) or a full refresh:
SM_MUTATIONS=1 node scripts/capture-responses-browser.mjs   # omit SM_MUTATIONS for read-only
#    (one-time: npm i -D playwright && npx playwright install chromium)

# 2. regenerate capability pages   (REQUIRED whenever any source/type/ui/response changed)
npm run gen-capabilities

# 3. regenerate the TypeDoc reference   (only if TSDoc or tsconfig entryPoints changed)
npm run doc

# 4. verify
ls docs/capabilities/_responses/*.json | wc -l   # coverage vs method count
git status

# 5. ship
git add -A && git commit -m "<message>"
npm version patch && npm publish          # so run_public_api + consumers see new methods
npm run bump-tracker                       # flow into live _smartico.api
#    RAG re-indexes automatically (JobLLM2, env2 cron) — no manual step.
```

Drop steps that don't apply (e.g. no entryPoints change → skip `npm run doc`;
no method change → skip capture). If hand-edited generated files were found,
lead with a ⚠️ telling the human to move the edit into the source first.

## Output format

1. **Changed (uncommitted + recent commits)** — short bullet list, grouped by impact.
2. **Stale / missing** — what's out of date and why (pages not regenerated, methods with no captured response, types missing from entryPoints, hand-edited generated files).
3. **Run this** — the ordered, trimmed command plan from Step 4.

Then stop. No edits, no execution beyond read-only inspection.
