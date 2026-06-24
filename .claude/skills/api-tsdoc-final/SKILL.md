---
name: api-tsdoc-final
description: Run the FULL Smartico public-api documentation-refresh batch in one pass — actualize the `_smartico.on` callback list, refresh the `_smartico` object reference, extend the native WebSocket protocol doc, enrich WSAPI method TSDocs (via the api-tsdoc skill), keep the transforms concept + doc-build wiring current, and finish by preparing a commit message for human review. Use when the user types `/api-tsdoc-final`, or asks to "do the full docs batch", "refresh all SDK docs", or "actualize the public-api docs".
---

# api-tsdoc-final

The end-to-end documentation refresh for the Smartico **public-api** SDK
(`/Users/aa/Desktop/SM/public-api/`). It orchestrates every documentation
action performed per release into one ordered batch, then stops at a prepared
commit message for a human to review.

This skill **wraps** the per-method [`api-tsdoc`](../api-tsdoc/SKILL.md) skill —
it does not replace it. `api-tsdoc` enriches one domain/method (hive extraction,
validation, UI guides, spillover, README + doc-todo housekeeping). This skill
adds the surrounding documentation surfaces that aren't tied to a single WSAPI
method: callbacks, the `_smartico` object, the native protocol, the transforms
concept, and the doc-build wiring — and ties it all off with a review-ready
commit message.

## Hard rules (same spirit as api-tsdoc)

- **NEVER commit, stage, or push.** This skill ENDS by *preparing* a commit
  message for human review (step 7). Do not run `git commit` / `git push`.
- **NEVER run `npm run doc`.** It is human-triggered. The skill leaves a
  verification checklist for the human to run it and confirm a clean build.
- **Edit only:**
  - `.ts` under `public-api/src/` (domain classes, `WSAPITypes.ts`, and the
    vendored `SmarticoLib/index.ts` enum — see step 1 caveat),
  - UI guides under `public-api/docs/ui/<domain>/`,
  - the hand-authored concept docs `public-api/docs/{Callbacks,SmarticoObject,Transforms}.md`,
  - the native protocol `public-api/docs/native/PROTOCOL.md` (+ `ADDING_METHODS.md`),
  - `public-api/tsconfig.json` (only `typedocOptions.entryPoints` and `projectDocuments`),
  - `public-api/README.md`, `public-api/doc-todo.md`.
- **NEVER edit `public-api/docs/api/**`** — TypeDoc output, wiped by
  `cleanOutputDir: true` on every `npm run doc`. To add an interface page,
  add its source `.ts` to `tsconfig` `entryPoints` (never hand-create the `.md`).
- **`server/llm-sources/` is a read-only RAG mirror and off-limits by default.**
  Canonical sources are the tracker repo and the live help site
  (`help.smartico.ai`). If the help-page narrative is needed, ask the user to
  point at the canonical help repo, or proceed only on explicit user override.
- Keep all `/** */` and concept-doc content **consumer-facing** — no internal
  class/file refs, ClassId values (except in PROTOCOL.md, which is the raw
  protocol spec), DB schemas, or Jira refs. Reference the in-tracker UI as
  "the default Smartico UI".

## Sources of truth

| Artifact | Edit | Canonical source(s) to read |
|---|---|---|
| Callback list (`docs/Callbacks.md`) | `public-api/docs/Callbacks.md` | `tracker/submodule/client-common-libs/src/lib-common/enum/ExternalCallbackKey.ts` (the 18-key enum) + trigger sites: `tracker/src/tracker/{Tracker,Gamification,Smartico,TrackerVisitor}.ts` (grep `triggerExternalCallBack`) + iframe-origin emitters in `tracker/ach/src/core/engine/{SawEngine,UserEngine}.ts` |
| Vendored callback enum | `public-api/src/SmarticoLib/index.ts` (`declare enum EXTERNAL_CALLBACK_KEY`) | Same `ExternalCallbackKey.ts` (keep in sync; it's a generated bundle — see step 1) |
| `_smartico` object (`docs/SmarticoObject.md`) | `public-api/docs/SmarticoObject.md` | `tracker/src/tracker/Smartico.ts` (grep `public static`); deep-link values from `DpType` + widget types from `EWidgetType` (verify against `public-api/src/SmarticoLib/index.ts` / `tracker/src/shared/Enums.ts`) |
| Native protocol (`docs/native/PROTOCOL.md`) | `public-api/docs/native/PROTOCOL.md` | Concept in `public-api/docs/native/ADDING_METHODS.md`; ClassIds from `public-api/src/Base/ClassId.ts`; raw request/response shapes from `public-api/src/SmarticoAPI.ts` + the per-domain `*Request.ts` / `*Response.ts` |
| WSAPI method TSDocs + UI guides | `public-api/src/WSAPI/*.ts`, `docs/ui/<domain>/` | Delegated to the `api-tsdoc` skill |
| Transforms concept (`docs/Transforms.md`) | `public-api/docs/Transforms.md` | `grep -rn "export const .*Transform" src/` + `*T` methods in `public-api/src/SmarticoAPI.ts` |
| Build wiring | `public-api/tsconfig.json`, `public-api/scripts/postdoc-cleanup.js` | — |

## Workflow

Run the steps in order. Each step is idempotent — it reconciles the doc against
the current code, so re-running the skill just picks up the delta. Track
progress with TaskCreate/TaskUpdate (one task per step).

### Step 1 — Actualize callbacks (`_smartico.on`)

1. Read the canonical enum `ExternalCallbackKey.ts`. Diff its keys against:
   - the events documented in `docs/Callbacks.md`, and
   - the `declare enum EXTERNAL_CALLBACK_KEY` in `src/SmarticoLib/index.ts`.
2. For each **new** key: grep the tracker for its `triggerExternalCallBack(EXTERNAL_CALLBACK_KEY.X, ...)`
   site(s) to capture the exact handler arguments; for iframe-origin events
   (`MNIGAME_WIN`, `ACH_GAME_OPENING`, `GF_UX`) read the ach emit sites. Add a
   row to the Callbacks.md event table (grouped: Lifecycle / User state / Widget
   lifecycle / Wins & launches / Errors) with when-it-fires + handler args.
3. For **removed/renamed** keys: remove/adjust the row.
4. Sync `src/SmarticoLib/index.ts`'s enum to match canonical (keep canonical
   order). **Caveat:** that file is `// Generated by dts-bundle-generator` — there
   is no regen script in this repo, so it's a committed vendored artifact;
   editing it aligns the committed copy with canonical, but flag in the return
   summary that the upstream smartico.js `.d.ts` bundle should be regenerated so
   it doesn't drift back.
5. Keep Callbacks.md links plain-text (no relative `.md` links — see step 6
   "media-copy" note).

### Step 2 — Update the `_smartico` object reference

1. Read `Smartico.ts`; list `public static` methods + the `api` / `vapi`
   members. Diff against `docs/SmarticoObject.md`.
2. Add/adjust method entries (signature, behavior, preconditions, visitor-mode
   notes). Group: Setup & identity / User profile / Deep links & embedding /
   Events & analytics / Push / Visitor games / Data API / Utilities.
3. Verify the deep-link table values against the `DpType` enum and widget types
   against `EWidgetType`. Cross-reference `on`/`off` to Callbacks.md (plain text).
4. (Optional) If the user authorizes reading the help page, fold in operator-
   facing narrative (session/login window, identity-via-globals + hash formula,
   control-group flag, URL-triggered deep links, localhost flag, IFrame bridge).

### Step 3 — Extend the native protocol doc

Follow the `docs/native/ADDING_METHODS.md` concept for any WSAPI method **not yet
in PROTOCOL.md**:

1. Determine which methods are missing: compare PROTOCOL.md's API-Methods ToC
   against the WSAPI surface. **Exclude GamePick** (`gamePick*`) — it's HTTP REST
   to a separate games server, not the WebSocket protocol.

   **Name-mapping caveat (avoid false positives).** PROTOCOL.md is keyed by
   **protocol-layer** method names, NOT the WSAPI wrapper names — a naive
   string-match of WSAPI names against the ToC reports many already-covered
   methods as "missing". Map before concluding a gap; known aliases:
   | WSAPI wrapper | PROTOCOL.md name |
   |---|---|
   | `jackpotGet` | `getJackpots` |
   | `getActivityLog` | `getPointsHistory` |
   | `getUserLevelExtraCounters` / `getCurrentLevel` | `getUserGamificationInfo` (level/counters derived) |
   | `miniGameWinAcknowledgeRequest` | `miniGameWinAcknowledge` |
   | `markUnmarkInboxMessageAsFavorite` | `markInboxMessageAsFavorite` |
   | `checkSegmentMatch` | covered by `checkSegmentListMatch` (shared request) |
   | `getBadges` | shares `GET_ACHIEVEMENT_MAP` with `getMissions` (no own section) |
   | `setNickname` | `setCustomUsername` |
   Confirm a true gap by checking the **request ClassId** isn't already documented
   (grep the CID in PROTOCOL.md), not just the method name. Client-only derived
   methods (e.g. `getCurrentLevel`) have no protocol call and are correctly absent.
2. For each missing WS method: find request/response ClassId (numeric) in
   `Base/ClassId.ts`; document the **raw** wire shape (NOT the friendly `T`
   types) as request + response field tables; add `### Error Codes` table when
   the method has named codes; add a JSON example where helpful.
3. Link complex array/object types to `../api/interfaces/<Type>.md`. If that page
   doesn't exist, **add the interface's source `.ts` to `tsconfig` `entryPoints`**
   (do NOT hand-create the `.md` in `docs/api/`). Or inline a compact field table.
4. Add ToC entries (new `####` categories as needed); GitHub auto-slugs anchors.
5. Note: a method that shares a request with another (e.g. `getBadges` reuses
   `GET_ACHIEVEMENT_MAP_REQUEST` from `getMissions`) needs no new section —
   just confirm the shared section documents the distinction.

### Step 4 — Enrich WSAPI method TSDocs (delegate to `api-tsdoc`)

Run the `api-tsdoc` skill for the target domain(s)/method(s) the user named (or,
with no target, scan `src/WSAPI/WSAPI<Domain>.ts` for thin TSDocs and propose a
list). `api-tsdoc` owns: hive extraction + mandatory validation pass, the
TSDoc/UI-guide contract, UI guides under `docs/ui/<domain>/`, spillover into
`WSAPITypes.ts`, and the README "UI Guides" column + `doc-todo.md` tally + SDK
gaps list. Do not duplicate that work here — invoke the skill.

### Step 5 — Refresh the transforms concept doc

Re-survey `grep -rnE "export const [A-Za-z]+[Tt]ransform" src/` and the `*T`
methods in `SmarticoAPI.ts`. If new domains/transforms appeared, update
`docs/Transforms.md` (the three naming conventions table, the "what a transform
does" categories, and the before/after example stay accurate). Keep its links
plain-text.

### Step 6 — Build hygiene (NO `npm run doc`)

Reconcile the doc-build wiring so the next human `npm run doc` is clean:

- **Entry points**: every interface `.md` linked from PROTOCOL.md (or a `{@link Type}`
  that should resolve) must have its source `.ts` in `tsconfig` `entryPoints`.
- **projectDocuments**: every hand-authored concept doc
  (`Callbacks.md`, `SmarticoObject.md`, `Transforms.md`, + any new one) must be
  listed in `tsconfig` `typedocOptions.projectDocuments`, AND linked from README.
- **No relative `.md` links inside concept docs / project documents.** TypeDoc
  media-copies resolvable relative `.md` links into `docs/api/_media/`; use
  plain-text references (e.g. "see `docs/native/PROTOCOL.md`") instead.
- **`@param` warnings**: a destructured object param **without** a `= {}` default
  makes TypeDoc warn on `@param params.*` ("not used"). Fix by moving the
  descriptions onto the inline type-literal properties as `/** */` comments and
  removing the `@param params.*` tags (do NOT add `= {}` to params that have
  required fields). Methods with `= {}` defaults are fine as-is.
- **Unresolved `{@link}` warnings**: a `{@link method}` to a method defined
  *later* in the WSAPI inheritance chain won't resolve → convert to backtick
  code (`` `method` ``). For an enum/type (e.g. `JoinClanErrorCode`), prefer
  adding its source to `entryPoints` so the link resolves.
- Leave the human a checklist (step 8) to run `npm run doc` and confirm zero new
  warnings + that `docs/api/documents/<concept>.md` generated.

### Step 7 — Prepare the commit message (DO NOT COMMIT)

1. Run `git status` and `git diff --stat` from `public-api/`.
2. Draft a single review-ready commit message grouped by area
   (callbacks / `_smartico` object / native protocol / WSAPI TSDocs / transforms /
   build wiring). Conventional-commit style, e.g.:

   ```
   docs(public-api): refresh SDK docs — callbacks, _smartico object, native protocol, <domains>

   - callbacks: add <N> events to Callbacks.md; sync EXTERNAL_CALLBACK_KEY vendored enum
   - _smartico object: <added/updated methods>
   - native protocol: document <methods> (ClassIds <…>); +<N> interface entry points
   - WSAPI TSDoc: enrich <domain> (<N> methods, <N> UI guides) via api-tsdoc
   - transforms: <delta or "verified current">
   - build: projectDocuments/entryPoints wiring; fixed <N> typedoc warnings
   ```
3. **Present it for review. Do not run `git commit`.** Surface, separately: the
   SmarticoLib enum regen caveat (step 1), any hive-sourced claims not directly
   verified, and any links pending the next `npm run doc`.

### Step 8 — Verification checklist (for the human)

Output these for the human to run after review:

```sh
cd /Users/aa/Desktop/SM/public-api
# tsconfig is valid + concept docs wired
node -e "const o=require('./tsconfig.json'); console.log(o.typedocOptions.projectDocuments)"
# concept docs have no relative .md links (media-copy safe)
grep -nE "\]\([a-z][^)]*\.md" docs/Callbacks.md docs/SmarticoObject.md docs/Transforms.md || echo OK
# every PROTOCOL.md interface link has a target after npm run doc
npm run doc            # human-run; confirm ZERO new warnings
grep -rn "../../docs/ui/" docs/api/classes/ && echo BROKEN || echo OK
```

## Output (return summary)

- **Per-step delta**: what changed in each surface (callbacks added, `_smartico`
  methods touched, native methods documented, domains enriched, transforms delta,
  build wiring).
- **Files edited** (paths).
- **The prepared commit message** (for review — not committed).
- **Open items / caveats**: SmarticoLib enum regen, links pending `npm run doc`,
  any unverified hive claims, the help-page (llm-sources) source caveat.
- **Cost**: hive totals from the `api-tsdoc` sub-run.

Then **stop**. No commit, no push, no `npm run doc`.

## Notes / scope reminders

- GamePick is HTTP REST (separate `r-games-server`), excluded from PROTOCOL.md.
- `getBadges` shares `GET_ACHIEVEMENT_MAP_REQUEST` with `getMissions` — no
  separate native section.
- `doc-todo.md` (running tally + numbered SDK-gaps list) is maintained by the
  `api-tsdoc` sub-run in step 4; the batch just confirms it's updated.

## Step 6.5 — Capability pages (RAG ingestion lane)

After the method TSDocs are enriched (step 4) and before the verification
checklist, refresh the **capability pages** — the docs the IDE coding agent
actually retrieves (`docs/capabilities/<method>.md`, generated by the public-api
repo's `scripts/gen-capabilities.js`). The IDE's `api` search lane is wired to
read **only** these (bo_server `LLMSourceTypeId.PUBLIC_API_CAPABILITY`), not the
raw source — so a method with no capability page is invisible to the agent.

Two sub-steps (see the `api-tsdoc` skill's "Capability pages" section for the full
recipe — capture conventions, anonymization, the `run_public_api` creds, the
`getUserProfile`/tracker-state browser fallback):

1. **Capture missing/stale responses.** For every method enriched this batch (and
   any with no `docs/capabilities/_responses/<method>.json` yet), capture a real
   response via `mcp__hive__run_public_api`, anonymize, and write the JSON. Track
   coverage: `ls docs/capabilities/_responses/ | wc -l` vs the method count.
2. **Regenerate.** `npm run gen-capabilities` → rewrites all
   `docs/capabilities/*.md`. Spot-check a handful (right per-domain field
   comments, real example response present, no internal-name leaks surfaced from a
   field comment — fix any leak at the source type, then re-run).

Add a line to the verification checklist for the human:

```sh
npm run gen-capabilities   # regenerate capability pages
# every capability page that should have a real response payload has one:
for m in getMissions getStoreItems getTournamentsList getMiniGames getInboxMessages; do
  test -f docs/capabilities/_responses/$m.json && echo "OK   $m" || echo "MISS $m"; done
```

**Never hand-edit `docs/capabilities/*.md`** (generated, overwritten). Do not
commit; this is part of the review-ready batch like everything else.
