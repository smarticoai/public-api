---
name: api-tsdoc
description: Enrich TSDoc comments in Smartico's public-api SDK (`/Users/aa/Desktop/SM/public-api/src/`) by mining real-world usage from the `ach` codebase and validating against server-side handlers. Use when the user asks to document, enrich, or improve TSDoc for any `_smartico.api.*` method or related WSAPI type.
---

# api-tsdoc

Enrich a Smartico public-api SDK method's TSDoc with real-world implementation insights from `ach` (the in-tracker gamification UI) + `r-server` (the protocol-handler backend). Apply edits directly, never commit.

## When to invoke
- User types `/api-tsdoc <method-or-feature>`
- User asks: "enrich TSDoc for X", "document X using ach", "improve SDK docs for X"
- User points at a `_smartico.api.*` method whose TSDoc is thin

## Hard scope rules

- **ONLY edit `.ts` files under `/Users/aa/Desktop/SM/public-api/src/`** (the domain class files: `WSAPI/WSAPI<Domain>.ts` — see "File layout" below — plus `WSAPI/WSAPITypes.ts` for return-type interfaces, occasionally `SmarticoLib/*`).
- **ONLY write UI guidance to `.md` files under `/Users/aa/Desktop/SM/public-api/docs/ui/<domain>/UIGuide_<methodName>.md`** — never inline long UI sections in TSDoc. The method's TSDoc gets a single `**UI guidance**: see [link]` reference.
- **NEVER edit `/Users/aa/Desktop/SM/public-api/docs/api/**`** — TypeDoc-generated; gets overwritten by `npm run doc`.
- **NEVER run `npm run doc`** — human-triggered separately after a batch of approved enrichments.
- **NEVER commit, stage, or push.** All changes wait for human review.
- **NEVER skip the validation pass** — server-side semantics (Java handlers in r-server) are the most common place ach-only extraction misses something. The first round on `requestMissionOptIn` literally got the error-code list wrong without validation.
- **NEVER paste ach-internal types** (`AchievementOptinRequest`, `ProtocolMessage`, `Context.interaction.*`, anything from `lib-common/protocol/*`) into examples or @remarks. Translate to SDK-shaped behavior.
- **NEVER use pseudo-API handlers** in `@example` blocks (`showError`, `showUnlockTasks`, `refreshUI`, `notify`, `toast`, etc.). Instead, use `console.log()` / `console.error()` with **descriptive messages that state what the consumer's UI should actually do at that point**. The example then doubles as documentation of expected UI behavior without committing to any particular framework.
  Bad: `showError(r.err_message)`
  Good: `console.error('[smartico] opt-in failed — show error toast with this message to the user:', r.err_message)`
- **NEVER expose internal Smartico implementation details** in `/** */` blocks. This is the public SDK contract — 3rd-party integrators read these docs. Specifically banned in `@remarks` / `@example` / `@param` / `@returns`:
  - **DB schemas / table / column / function names**: `cjm_ach.ach_category`, `ach_completed`, `ach_completed_recurring`, `cjm.users`, `sm_crm.*`, `spk_ai.*`, `fnc_get_user_achievements_map`, `fnc_ach_unlock`, etc. Talk about *behavior*, not storage.
  - **Server-side class / method / file references**: `AchievementService.java`, `AchievementOptinRequestHandler`, `AchievementsMultiLabelConsumer:L182-191`, `WsSessionManager.postProcess`, `TagReplacementDbService`, `AchievementsDbService.optInToAchievement`, etc. Talk about *what the server does*, not which class does it.
  - **Internal numeric status / enum codes**: "(status 1)", "(status 4)", "category_status_id = 1", "ach_status_id = 7". Refer to **public** enums by name (e.g. `AchievementStatus.RECURRING`, `AchievementAvailabilityStatus`) but never expose raw numeric codes for internal-only enums.
  - **Internal label-setting keys**: `DEMO_ALWAYS_SEND_RELOAD_ACHIEVEMENT`, `SHOW_COMPLETED_GAMIFICATION_NOT_VISIBLE`, `GAMIFICATION_VISTOR_MODE_USER_EXT_ID`. Talk about *configurable behavior*, not setting keys.
  - **Internal cache / infra names**: `OCache`, `ECacheContext`, `CACHE_DATA_SEC`, "server-side OCache 60 s", "HTTP Cache-Control: max-age=300", "BigQuery analytics event", "Kafka event", "in-memory cache invalidated", "`updateMissions()`". Say "the SDK caches the response for 30 seconds" — not which class/key/constant implements it.
  - **Jira ticket refs**: `(SMR-46737)`, `DESK-1234`. Internal tracker noise.
  - **BO admin paths**: "BO → Gamification → Settings → Categories". Say "configured by the operator" or omit. Operator-facing UI paths are out of scope for the SDK contract.
  - **File:line refs into r-server / bo-server / ach**: `AchievementService.java:L375-405`, `AchievementsDbService:L3378-3385`. These belong in the agent's return summary for the human reviewer, not in any source-file comment.
  - **`ClassId` enum values** (e.g. `ClassId.MISSION_OPTIN_RESPONSE`, `ClassId.BUY_SHOP_ITEM_RESPONSE`, `ClassId.CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT`, `ClassId.RELOAD_ACHIEVEMENTS_EVENT`). Even though `ClassId` is technically exported, it's a **protocol-layer abstraction** the SDK consumer should never need to think about. The consumer's mental model is "I call `getMissions({onUpdate})` and my callback fires" — NOT "I subscribe to `MISSION_OPTIN_RESPONSE`". Every push event reaches the consumer via some API surface (an `onUpdate` callback on a fetch method, a Promise resolution on a mutation, a state-update on a user-profile field). Describe the API trigger, not the wire-level event. Examples:
    - Bad: `{@link ClassId.MISSION_OPTIN_RESPONSE} — fired after opt-in.`
    - Good: `Fires after \`requestMissionOptIn(...)\` resolves (any \`err_code\`).`
    - Bad: `the SDK refreshes on a {@link ClassId.BUY_SHOP_ITEM_RESPONSE} push`
    - Good: `the SDK refreshes after every \`buyStoreItem(...)\` call resolves`
    - Bad: `balances arrive via {@link ClassId.CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT}`
    - Good: `balances on \`getUserProfile()\` are kept live by the SDK's user-properties channel`
  
  **What IS safe to reference** in `/** */`:
  - **Public status/enum types**: `AchievementStatus`, `AchievementAvailabilityStatus`, `SAWSpinErrorCode`, `JoinClanErrorCode`, etc. — anything `export enum`-ed under `src/Missions/`, `src/MiniGames/`, etc. Reference by enum **name**, not by numeric value.
  - **Fields on the public return type** (e.g. `TMissionOrBadge.is_opted_in`, `mission.ach_public_meta.hide_locked_mission`) — these are part of the SDK contract.
  - **Numeric error codes returned by the SDK method itself** (e.g. `40010`, `40014`) — these reach the consumer in `err_code`, so consumers must branch on them. Document the codes WITHOUT exposing which internal handler emits them.
  - **Other public SDK methods** (`{@link buyStoreItem}`, `{@link getMissions}`) — these are part of the SDK contract.
  
  **Reference UI naming**: when documenting "the reference UI does X" (e.g. ach's specific rendering pattern), call it **"the default Smartico UI"** — not "the official tracker", "ach", "the tracker UI", or any internal name. This matches public marketing language.
  
  **Rule of thumb**: if removing the internal-name reference makes the doc less useful to a 3rd-party widget developer, you needed a better consumer-facing phrasing — not the internal name. Internal-reference audit trails belong in the agent's return summary to the human reviewer, NOT in source-file comments.

## Type / method documentation contract

A clean separation between the type docs (`WSAPITypes.ts` field comments) and the method docs (`WSAPI<Domain>.ts` TSDoc) keeps both useful without bifurcating information across two large surfaces.

**`WSAPITypes.ts` field comments** — terse, lookup-friendly reference. One short sentence per field stating:
- What it is (the SDK field name and what it represents)
- Type if non-obvious (e.g. "Unix ms timestamp", "0–100 integer percentage")
- Null/undefined semantics ("Undefined for badges", "Null when unlimited")
- Cross-reference to a public enum if the values come from one

That's it. Do NOT expand field comments into multi-paragraph behavioral essays. Consumers and AI agents look these up; they don't read them top-to-bottom.

**Method `WSAPI<Domain>.ts` TSDoc** — narrative, usage-oriented prose. Explains **how to use** the call:
- Preconditions, error codes, refresh semantics, idempotency, side effects, cache, visitor mode
- WHEN fields update relative to the call (e.g. "after `requestMissionOptIn(...)` resolves, `is_opted_in` flips on the next refresh — not optimistically")
- Recommended UI patterns that depend on field combinations
- Inline references to specific fields when they're load-bearing for the explanation

Do NOT include a **`Field semantics`** bullet section in method TSDoc that parallels the type's field list. That creates a second field-by-field reference that drifts from the type docs over time, and forces AI agents to load both `WSAPITypes.ts` and the method file to assemble the full picture.

**Discriminator 1 — parallel reference (method-side)**

If you're about to write a bullet that's "`field_name` is/means X" and the next bullet is the same shape for another field, you're writing a parallel reference and should stop. Move that content into prose somewhere else in @remarks — Refresh after success / Subscription model / UI guidance — where the field is mentioned in the context of WHAT YOU DO with it, not WHAT IT IS.

| Bad (parallel reference) | Good (usage prose) |
|---|---|
| `**Field semantics**`<br>`- ` is_opted_in ` does NOT flip optimistically...`<br>`- ` dt_start ` doubles as opt-in timestamp...` | `**Refresh after success**`<br>The SDK auto-refreshes the mission list on response. `is_opted_in` becomes true on the refreshed array; don't flip it optimistically. `dt_start` on the refreshed mission is the opt-in timestamp; expiration is `dt_start + time_limit_ms`. |

**Discriminator 2 — definition vs. instruction (type-side)**

A field comment answers: "what is this field?" — a definition. A method TSDoc answers: "what do I do with it?" — an instruction.

If a field comment contains any of these, the content belongs in the method TSDoc, not the field:
- An imperative verb in the consumer's voice ("sort by …", "pass to …", "never cache …", "always read from a fresh fetch", "must call X first")
- A code snippet showing the consumer using the value (e.g. `categories.sort(...)`)
- A multi-step instruction
- A cross-method invariant ("call Y before this", "after Z the field flips")

Field comments may include: what the value represents · type/units (px, ms, 0–100 percent, Unix-ms timestamp) · null/undefined semantics · cross-ref to the public enum the values come from · one short "Returned by `getX()`" pointer. That's it.

| Bad (instruction in field comment) | Good (definition in field; instruction in method) |
|---|---|
| `name: Display label. Pre-translated to the user's stored language. In visitor mode driven by ` `_smartico.vapi(lang)` `. Falls back to EN. Never null.` | Field: `name: Display label, pre-translated server-side. Never null.`<br>Method TSDoc: `**Localization**: server pre-translates to user language; falls back to EN; visitor mode uses ` `vapi(lang)` ` argument.` |
| `order: Relative position (lower first). Server does NOT pre-sort — caller must run ` `categories.sort((a,b)=>a.order-b.order)` `. Default 1.` | Field: `order: Relative display position (lower = first). Default 1.`<br>Method TSDoc: `**Sort order**: server does NOT pre-sort; caller must sort by ` `order` ` ascending.` |
| `xxx_completed_id: Stable identifier of the completion. Pass to ` `requestXxxClaim()` `. Always re-read from a fresh ` `getXxxs()` ` result; never synthesise or cache across sessions. Undefined for badges and incomplete entries.` | Field: `xxx_completed_id: Stable identifier of this completion. Undefined for entries not yet completed.`<br>Method ` `@param` ` block: usage / never-cache / freshness guidance. |

**Wrapper result types — the most common type-side violation**

Interfaces that exist solely to wrap one method's return value — typically `TXResult` with `err_code` / `err_message` — are 1:1 with their owning method. The method's TSDoc owns the full error-code table; the wrapper type's `err_code` field is one short sentence + pointer:

```ts
/** Error code. `0` = success. See `<methodName>` TSDoc for the full table. */
err_code: number;
/** Optional error message; populated on non-zero `err_code`. */
err_message: string;
```

Do NOT enumerate the same codes in both places. Two places to maintain when a new code is added is exactly the bifurcation the contract is meant to prevent. If you find an existing wrapper-type comment with the table duplicated (an artifact from pre-contract enrichment), trim it on the spillover pass — see step 8.

**Organic cleanup**: For existing docs that violate either discriminator: rewrite when next touching that method or type. Don't do a sweep-clean — organic cleanup is fine.

## File layout

The SDK surface is split across one class per domain via an inheritance chain. The public name `WSAPI` is the terminator; consumers call `_smartico.api.X(...)` and the method resolves up the prototype chain. Each domain class lives in its own file:

| Domain class | File | Methods |
|---|---|---|
| `WSAPIBase` | `src/WSAPI/WSAPIBase.ts` | abstract; constructor, shared state, `clearCaches`, `updateEntity` helper, `onUpdateContextKey` enum |
| `WSAPIUser` | `src/WSAPI/WSAPIUser.ts` | `getUserProfile`, `getCurrentLevel`, `getLevels`, `getUserLevelExtraCounters`, `checkSegmentMatch`, `checkSegmentListMatch` |
| `WSAPIGeneral` | `src/WSAPI/WSAPIGeneral.ts` | `getCustomSections`, `getTranslations`, `reportImpressionEvent`, `reportClickEvent`, `getActivityLog`, `getRelatedItemsForGame` |
| `WSAPIMissions` | `src/WSAPI/WSAPIMissions.ts` | `getMissions`, `getBadges`, `getAchCategories`, `requestMissionOptIn`, `requestMissionClaimReward` |
| `WSAPIBonuses` | `src/WSAPI/WSAPIBonuses.ts` | `getBonuses`, `claimBonus` |
| `WSAPIStore` | `src/WSAPI/WSAPIStore.ts` | `getStoreItems`, `buyStoreItem`, `getStoreCategories`, `getStorePurchasedItems` |
| `WSAPITournaments` | `src/WSAPI/WSAPITournaments.ts` | `getTournamentsList`, `getTournamentInstanceInfo`, `registerInTournament`, `getClanTournamentPlayers` |
| `WSAPIClans` | `src/WSAPI/WSAPIClans.ts` | `getClans`, `getClanInfo`, `joinClan` |
| `WSAPIJackpots` | `src/WSAPI/WSAPIJackpots.ts` | `jackpotGet`, `jackpotOptIn`, `jackpotOptOut`, `getJackpotWinners`, `getJackpotEligibleGames` |
| `WSAPIRaffles` | `src/WSAPI/WSAPIRaffles.ts` | `getRaffles`, `getRaffleDrawRun`, `getRaffleDrawRunsHistory`, `claimRafflePrize`, `requestRaffleOptin` |
| `WSAPIMiniGames` | `src/WSAPI/WSAPIMiniGames.ts` | `getMiniGames`, `getMiniGamesHistory`, `playMiniGame`, `miniGameWinAcknowledgeRequest`, `playMiniGameBatch` |
| `WSAPIAvatars` | `src/WSAPI/WSAPIAvatars.ts` | `getAvatarsList`, `getAvatarsCustomized`, `getAvatarPrompts`, `setAvatar` |
| `WSAPIGamePick` | `src/WSAPI/WSAPIGamePick.ts` | `gamePickGet*`, `gamePickSubmit*` (9 methods) |
| `WSAPILeaderBoard` | `src/WSAPI/WSAPILeaderBoard.ts` | `getLeaderBoard` |
| `WSAPIInbox` | `src/WSAPI/WSAPIInbox.ts` | `getInboxMessages`, `getInboxUnreadCount`, `markInboxMessageAsRead`, `markAllInboxMessagesAsRead`, `markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`, `deleteAllInboxMessages`, `getInboxMessageBody` |
| `WSAPI` (terminator) | `src/WSAPI/WSAPI.ts` | empty body; constructor runs push-subscription wiring |

**UI guides** live at `docs/ui/<domain-slug>/UIGuide_<methodName>.md`. Domain slugs in use today: `missions/`, `store/`. When enriching a method in a domain that doesn't have a UI directory yet, create it (`docs/ui/<lowercase-domain>/`).

## Workflow

### 1. Locate the SDK method

First identify which domain class file owns the method using the file layout below. Then read that file and find the target method. Capture:

- Current TSDoc (the floor — don't lose existing content like "Visitor mode: not supported")
- Method signature + return type
- The internal `this.api.xxx(...)` it wraps — that's the **protocol-layer name** (e.g. `requestMissionOptIn` wraps `missionOptIn`)
- The return-type interface in `WSAPITypes.ts` (e.g. `TMissionOptInResult`) — read it too

### 2. Hive extraction (`mcp__hive__chat`)

Call hive with `goal: "Deep Dive Code"`, `mode: "high"`. Pass **both names** (SDK + protocol-layer) so hive can locate both sides.

Prompt template:

```
Investigate the Smartico ach codebase (the in-tracker gamification UI at
/Users/aa/Desktop/SM/tracker/ach/src) for the **<FEATURE>** flow.

Context: I'm enriching the TSDoc of `_smartico.api.<SDK_METHOD>(...)`. The
SDK wraps an internal `<PROTOCOL_METHOD>` that goes over the protocol layer
(ClassId `<CID_REQUEST>` → `<CID_RESPONSE>`). I need observable behavior
the SDK consumer needs.

Return a structured summary with these sections, citing ach files with
line numbers.

**Part A — API behavior**:

1. Call sequence — what runs before and after; prerequisite calls; follow-up calls
2. Response handling — which response fields ach consumes; which it ignores
3. Error codes — every distinct errCode value handled, with UI behavior per code
4. Refresh cadence / triggers — what triggers re-fetch after the call; push vs poll
5. Prerequisites / gating — user state, mission flags, level/brand/auth requirements
6. Idempotency — safe to call twice? guards against double-clicks?
7. Edge cases — locked, time-elapsed, deleted, network failure, timeout
8. Observable side effects — what other state changes (points, badges, visibility)

**Part B — UI rendering** (mandatory for fetch methods returning rich
entities and mutations with state-dependent buttons; omit subsections that
don't apply for the method type):

9. **List view** (fetch methods returning arrays of rich entities): how is
   the list organized? Tabs / sections / filter chips / flat list? Status
   bucketing — what buckets and what's the priority order for assignment?
   Sort order per bucket? Empty state copy per bucket? Pagination /
   virtualization (if any)?
10. **Item card / tile** (list-renderable entities): EVERY field from the
    response type that appears on a card; the visual hierarchy
    (title-image-status-progress-reward-CTA layout); what's NOT on the
    card and lives only in the detail view; whole-card click vs sub-element
    handlers.
11. **Detail view / popup** (entities with a "view more" expansion): the
    top-to-bottom section list; what fields appear ONLY in the detail vs
    also on the card; image size differences.
12. **Action button decision matrix** (entities with state-dependent
    actions): for every meaningful combination of entity state flags
    (locked, opted-in, completed, requires_claim, missed, expired, etc.),
    what button is shown with what label, when enabled/disabled, what
    click action is dispatched. This must be exhaustive.
13. **Image / asset specs**: documented source dimensions and aspect
    ratios for all image-bearing fields (entity icon, ribbon, thumbnails,
    etc.). Fallback handling when fields are empty.
14. **Status-specific visual treatments**: per status (locked / completed
    / missed / in-progress / featured / claimable), what visual modifier
    is applied (overlay icon, tint, glow, grayscale, etc.).
15. **Countdown / timing formatting** (entities with deadlines): the
    string format for time-remaining displays; update cadence;
    not-yet-started vs in-progress vs expired text variants.
16. **Animations / transitions**: list entry animations, popup open/close,
    progress bar fill, success celebrations, loading indicators.
17. **Mobile vs desktop**: differences in grid layout, card density, or
    interaction patterns.
18. **Empty / loading / error states**: copy and visual treatment.

Constraints on your answer:
- Focus on observable SDK-consumer behavior. Translate protocol-layer
  internals (ClassId, ProtocolMessage, lib-common/protocol/*,
  Context.interaction.protocolRequest) into "what happens" terms.
- Do NOT describe Redux/InteractionSlave/Context plumbing.
- Flag tracker-only behaviors (iframe height messaging, deep-link
  auto-dispatch, parent-frame postMessage scroll locks, etc.) as
  "tracker-only, ignore for SDK".
- Cite ach files with `file.ts:line` for every claim.
- For Part B, prefer concrete numbers (px, %, aspect ratios) over vague
  descriptions. If the dimension lives in SCSS that's not indexed, say so
  and quote the documented size from the TSDoc on the public type.
```

### 3. Direct verification

Read 3–5 cited ach files via `Bash`+`sed` or `Read` to verify hive's claims against actual code. Especially verify:

- **Exact error code numeric values** (`OptInErrorCode.AlreadyOptedIn = 40010` etc.)
- **Field-naming mismatch**: ach uses camelCase internally (`mission.isOptedIn`); SDK exposes snake_case (`mission.is_opted_in`). Examples must use SDK shape.
- **Control-flow branches**: response.errCode branches and what each one does

Do not skip this — hive's summary occasionally collapses or paraphrases logic that the direct read catches.

### 4. Draft TSDoc using the template below

### 5. Hive validation pass (MANDATORY)

A second `mcp__hive__chat` call to verify the draft's specific claims, especially anything sourced from server-side handlers (r-server Java code) that the ach-side analysis can't see.

Prompt template:

```
VALIDATION PASS for `<SDK_METHOD>`.

Context: I'm finalizing TSDoc for `_smartico.api.<SDK_METHOD>`. Verify
these claims with citations to the authoritative code path (use r-server
handlers, DB functions, ach engines — whatever is canonical).

For each claim, reply CONFIRMED / INCORRECT / PARTIAL with citation:

1. <claim>
2. <claim>
3. <claim>
4. <claim>

Don't re-narrate the full flow — just verify these claims.
```

Pick 3–5 claims that are:
- Server-side behavior (error codes, DB writes, side effects) — ach can't authoritatively confirm
- Cross-system invariants ("X is/isn't idempotent", "X triggers Y")
- Numeric thresholds (cadences, limits, timeouts)

If validation returns `INCORRECT` or `PARTIAL` for any claim, **update the draft before applying**. Add the corrected info; do not paper over the discrepancy.

### 6. Apply the Edit (TSDoc)

Use the `Edit` tool to replace the existing TSDoc block in the domain class file. The TSDoc keeps **only API behavior**: summary, `@remarks` sections (Preconditions, Error codes, Refresh, Idempotency, Side effects, Cache TTL, Visitor mode), `@param`, `@returns`, `@example`. UI guidance does NOT go inline — it lives in a separate markdown file (see step 7).

Replace any pre-existing `**UI guidance — X**` subsections with a single line:

```ts
 * **UI guidance**: see [UI Guide — `<methodName>`](../../docs/ui/<domain>/UIGuide_<methodName>.md).
```

The relative path `../../docs/ui/...` resolves from `src/WSAPI/` to the docs tree (this is the **source-side** path). The post-doc cleanup script (`scripts/postdoc-cleanup.js`) automatically rewrites this to `../../ui/<domain>/...` for the typedoc-rendered output at `docs/api/classes/<class>.md`, where the correct relative path is one segment shorter. If you ever bypass the post-doc cleanup, the rendered `.md` files will have broken UI guide links pointing into `docs/docs/ui/...` (which doesn't exist).

**Pre-apply audit** (10-second check on the draft before calling `Edit`):

- [ ] No bullet block in @remarks where each bullet has the shape `` `field_name` is/means X `` (Discriminator 1).
- [ ] No comma-separated prose list of fields all stating the same predicate (e.g. "`a`, `b`, `c`, `d` are not used") — group categorically instead ("opt-in / claim / recurring fields are not used"). A grouped phrase reads as one fact; an itemized list reads as a parallel reference.
- [ ] No two @remarks sections describing the same conceptual axis (e.g. `**Subscription model**` and `**What triggers async refresh**` both cover "what fires updates" — merge into one section with a sub-list, not two separate sections). LLMs doing section-level retrieval pull only one.
- [ ] No claim in @remarks that the summary sentence already states word-for-word. The summary is the one-line orientation; @remarks add detail, not echoes.
- [ ] Wrapper result type (`TXResult`) being touched in spillover: its `err_code` field comment is a one-line pointer to the method TSDoc, NOT a re-enumeration of the codes.
- [ ] Code snippet in @example uses only public SDK methods, public enums, and `console.log/error` for UI guidance (no pseudo-handlers).

Fix the draft *before* calling `Edit`. These violations are cheap to fix pre-write and expensive to find post-write.

Apply directly. Do NOT commit. Do NOT push. Do NOT run `npm run doc`.

Do NOT leave any `TODO:`, `TODOYY:`, `FIXME:`, `XXX:`, or similar reviewer-note comments in the source. All uncertainty — anything you're not 100% sure of, anything sourced only from hive without direct verification, anything that needs human / system-owner confirmation — goes into the **return summary** to the user, not into the code.

### 7. Write / update the UI guide markdown

For methods of type "Rich-entity fetch", "Single-entity detail fetch", or "Mutation with state-dependent label/branching" (see classifier below), write the full UI guidance to:

```
docs/ui/<domain>/UIGuide_<methodName>.md
```

The file is plain markdown — sections are `## Heading`, lists are markdown lists, code blocks are fenced. Structure:

```markdown
# UI Guide — `<methodName>`

## List view organization
<bucketing, sort, empty states>

## Item card / tile
<field-by-field render list, click target>

## Detail view / popup
<top-to-bottom layout>

## Action button decision matrix
<priority-ordered list of state combinations>

## Companion action caveats
<synchronous deep-links, etc.>

## Image / asset specs
<dimensions, aspect ratios, fallbacks>

## Status-specific visual treatments
<per status>

## Countdown / timing format
<6-tier compact format>

## Empty / loading / error states

## Animations / transitions

## Mobile vs desktop

## Performance
```

Omit sections that don't apply for the method type (e.g. a metadata-only fetch like `getStoreCategories` needs only `## List view organization`, `## Empty states`, `## Cache / refresh notes`).

**Style rules for the markdown** (same as the TSDoc rules):
- No protocol-layer references (no `ClassId.X`, no DB schema, no internal class names).
- Code examples use `console.log()` / `console.error()` with descriptive messages, never pseudo-API handlers.
- Reference the reference UI as "the default Smartico UI", not "official tracker" / "ach" / "the tracker".
- The TSDoc method link uses the format above so docs renderers (typedoc, GitHub, etc.) can navigate to the file.

For metadata-getters / scalars / fire-and-forget telemetry — **do NOT create a UI guide file**. The TSDoc just doesn't include the `**UI guidance**: see ...` line. The skill's classifier determines this.

### 8. Spillover updates and other cross-method effects

If the investigation surfaced corrections to OTHER methods, error codes, types, or mappings, apply those too. Common cases:

- **Related interface in WSAPITypes.ts** — apply the type/method contract (Discriminator 2 — definition vs. instruction). Two specific sub-patterns:
  - **Wrapper result type** (`TXResult` with `err_code` / `err_message` — exists 1:1 with one method): the `err_code` field comment is ONE line + pointer to the method TSDoc. Never enumerate the same code table in both files. If you find an existing wrapper with the table duplicated (pre-contract enrichment artifact), trim it now — this is the spillover step where that gets caught.
  - **Domain type** (e.g. `TStoreItem`, `TTournament`, `TMissionOrBadge`, `TAchCategory`): each field comment is a definition + null/undefined semantics. Scan for usage-prose drift (sort instructions, "never cache", translation chains, multi-step "always do X then Y" guidance) and strip — the method TSDoc owns it. Add a one-line `Returned by ` `getX()` `` pointer if missing.
- **A neighbor method has the same error codes** — note them in its TSDoc too if applicable. Cross-reference with "See `<other_method>` for the full error-code table."
- **An incorrect existing claim** in nearby TSDoc — fix it.
- **A type alias that returns the wrong shape** — fix the type and flag it as a potential breaking change in the return summary.

For each spillover, the same rules apply: apply directly, never commit, surface uncertainty in the return summary (not in code comments).

### 9. Post-write housekeeping (manual-support files)

Each per-method enrichment produces small deltas to manually-maintained files. Apply them as part of the same run.

#### 9a. Update the project `README.md`

The `README.md` at the public-api project root has an **API reference table** with a `UI Guides` column. After writing a UI guide markdown file (per step 7), add a link to it in the relevant row.

Format: each cell is a `·`-separated list of `` [`<methodName>`](docs/ui/<domain>/UIGuide_<methodName>.md) `` entries. Insert the new link in source-order (matches the order methods are declared in the domain class).

If the row currently shows `—` (no UI guides yet for that domain), replace `—` with the new link.

Skip this step for method-types where no UI guide was created (metadata getters / scalars / telemetry — see classifier).

#### 9b. Update `doc-todo.md` running tally

Add one row to the **Running tally** table at the bottom of `/Users/aa/Desktop/SM/public-api/doc-todo.md`:

```
| YYYY-MM-DD | `<methodName>` | ✅ | <todoyy-count> | $<hive-cost> | ~<min> min | — | <one-line note> |
```

Mark the method's checkbox in its domain section (`[ ]` → `[x]`) and add a brief one-line summary inline if applicable.

If the per-batch totals row at the bottom needs an update (cumulative method count, cost, etc.), update it too.

#### 9c. Fix cross-document links in the just-written UI guide

UI guide markdown is written into `docs/ui/<domain>/UIGuide_<methodName>.md`. When the source content was extracted (or hive-pulled) from a typedoc-rendered context, embedded links assume `docs/api/classes/` adjacency and are wrong from `docs/ui/<domain>/`. Three patterns recur:

| Original (wrong) | Fixed |
|---|---|
| `(WSAPIMissions.md#getmissions)` | `(../../api/classes/WSAPIMissions.md#getmissions)` |
| `(WSAPIStore.md#buystoreitem)` | `(../../api/classes/WSAPIStore.md#buystoreitem)` |
| `(../enumerations/AchievementAvailabilityStatus.md)` | `(../../api/enumerations/AchievementAvailabilityStatus.md)` |
| `(../interfaces/TMissionOrBadge.md)` | `(../../api/interfaces/TMissionOrBadge.md)` |
| `(#buystoreitem)` (bare anchor that pointed to a sibling method) | `(../../api/classes/WSAPI<Class>.md#buystoreitem)` — figure out the class from the inheritance chain |

Rule of thumb: any relative path in a UI guide that points to an SDK reference resource (class doc, interface doc, enum doc) must be prefixed with `../../api/` from `docs/ui/<domain>/`.

Run all three of these greps on the new UI guide and fix every match:

```sh
# Cross-class refs (the wsapi class name as a relative file)
grep -nE "\]\(WSAPI[A-Za-z]+\.md" docs/ui/<domain>/UIGuide_<methodName>.md

# Wrong-depth enum / interface refs (single `../` instead of `../../api/`)
grep -nE "\]\(\.\./[a-z]+/" docs/ui/<domain>/UIGuide_<methodName>.md

# Bare same-page anchors that should point to a sibling class
grep -nE "\]\(#[a-z]" docs/ui/<domain>/UIGuide_<methodName>.md
```

Then sanity-check that every target file exists:

```sh
# For each `(../../api/X/Y.md...)` reference, verify the file exists:
grep -ohE "\(\.\./\.\./api/[^)#]+\)" docs/ui/<domain>/UIGuide_<methodName>.md \
  | tr -d '()' \
  | while read p; do
      target="docs/$(echo "$p" | cut -c7-)"
      [ -f "$target" ] && echo "OK    $p" || echo "MISS  $p (looking at $target)"
    done
```

If any are MISS, the reference points to a doc typedoc never generated (e.g. a type that isn't in `tsconfig.entryPoints`). Two options: add the entry point and re-run `npm run doc`, or convert the broken link to backtick-code (`` `AchievementClaimPeriodTypeId` ``) so it renders as plain reference without a hyperlink.

#### 9d. Verify `npm run doc` still emits cleanly

Run `npm run doc` (from `/Users/aa/Desktop/SM/public-api`) and confirm:

- Exit code 0
- No new warnings beyond pre-existing ones
- `docs/api/classes/<DomainClass>.md` reflects the new TSDoc
- `docs/api/_media/` does NOT contain a stale copy of the new UI guide (post-doc cleanup handles this)

If warnings appear about unresolved `{@link X}` references, fix them by converting to backtick-code (`` `X` ``) when `X` is a public method in a class that's later in the inheritance chain — those don't resolve and there's no point in fighting it.

**Verify UI guide links in the generated class doc resolve correctly**. The post-doc cleanup script rewrites paths from `../../docs/ui/...` (source-side, relative to `src/WSAPI/`) to `../../ui/...` (rendered-side, relative to `docs/api/classes/`). Any broken rewrite would point at `docs/docs/ui/...`, which doesn't exist. Quick sanity check:

```sh
# Confirm no stray ../../docs/ui/ in rendered class docs (correct prefix is ../../ui/)
grep -rn "../../docs/ui/" docs/api/classes/ && echo "BROKEN" || echo "OK"

# Resolve every UI guide link in class docs and confirm the target exists
for p in $(grep -rohE '\(\.\./\.\./ui/[^)]+\)' docs/api/classes/ | tr -d '()' | sort -u); do
  target=$(python3 -c "import os; print(os.path.normpath('docs/api/classes/$p'))")
  [ -f "$target" ] && echo "  ✓ $p" || echo "  ✗ $p (missing $target)"
done
```

Same idea for UI guides: any reference into `docs/api/...` from a UI guide must use `../../api/...` (single `docs/` segment in the resolved path). Quick check for class docs and UI guides together:

```sh
# UI guides should not have a bare ../../docs/ui pattern either; they live in docs/ui/.
grep -rn "docs/docs/" docs/api/ docs/ui/ && echo "BROKEN" || echo "OK"
```

### 10. Present the result

Output a tight summary (under 300 words). Include:

- **Files edited** with paths
- **Sections added/changed** per file
- **Open questions / unverified claims** — anything sourced from hive that you didn't directly verify, anything that needs human or system-owner confirmation. This is the audit trail; be specific (cite the originating ach / r-server location for each claim so the reviewer can re-check).
- **Reviewer checklist** — server-side claims to confirm, type-shape risks, breaking changes, spillover edits to other methods/types
- **Cost** (hive call totals + duration)

Then **stop**. Do not commit. Do not run docs regeneration. Do not push.

## Output template — TSDoc structure

Use this skeleton for any async server-roundtrip SDK method. Trim sections that don't apply, but keep the order:

```ts
/**
 * <One-line summary of WHAT the method does and WHO it's for.>
 *
 * <Optional second sentence with the most important behavioral hook —
 * "events fired before opt-in don't count retroactively" — that the
 * consumer must know before reading the @remarks.>
 *
 * @remarks
 * **Preconditions**
 * <What must be true before calling. Reference the source of truth
 * for these flags (usually getX() / getProfile()).>
 *
 * **Error codes** (in `err_code`)
 * - `0` — success; <what happens>
 * - `<code>` — <semantic meaning>. <UI handling guidance.>
 * - <... one bullet per distinct named code from server>
 * - other non-zero — generic server error. Surface `err_message` if any.
 *
 * **<Behavior-specific section>** (e.g. "Time-limited missions",
 * "Pagination", "Cache TTL")
 * <Server-recorded invariants and timing rules.>
 *
 * **Refresh after success**
 * <How the SDK / consumer state updates after this call. Mention
 * any onUpdate callbacks, automatic cache busts, manual re-fetch
 * requirements.>
 *
 * **Idempotency**: <yes/no>. <If no, what code does a retry return?>
 * <Guidance on guarding the call site.>
 *
 * **Side effects**: <points, badges, levels, visibility of other
 * entities. Be explicit about what DOESN'T happen too.>
 *
 * **UI guidance**: see [UI Guide — `<methodName>`](../../docs/ui/<domain>/UIGuide_<methodName>.md).
 *
 * (UI guidance body lives in the linked markdown file — list bucketing,
 * card/detail layouts, action-button matrix, image specs, animations,
 * etc. The TSDoc only links; the markdown owns the content.)
 *
 * (Omit the `**UI guidance**: see ...` line entirely for metadata-only
 * getters, scalar counters, and fire-and-forget telemetry methods —
 * those don't need a UI guide. See the classifier below.)
 *
 * **Visitor mode**: <supported / not supported>
 *
 * @param <name>  <Description. Reference the source for the value.>
 * @returns <Shape. Success condition.>
 *
 * @example
 * ```ts
 * <Realistic snippet using SDK types only. Show the preconditions gate,
 * the loading state, and the per-error-code branches. Use console.log /
 * console.error with descriptive messages stating what the consumer's UI
 * should do at that point — NEVER use pseudo-handlers like showError,
 * showUnlockTasks, refreshUI, notify, toast, etc. The example must run
 * as-is (so a consumer can paste it and verify the flow in devtools)
 * AND describe expected UI behavior in the log message.>
 * ```
 */
public async <method>(...) { ... }
```

No reviewer-note comments (`TODO:`, `FIXME:`, `XXX:`, etc.) above the signature. Surface uncertainty in the return summary instead.

## Feature → ach subtree map

Orientation for hive prompts. Hive can explore wider on its own; this is just where to start.

| Feature | ach subtree(s) |
|---|---|
| Missions / Achievements | `core/engine/AchievementEngine.ts`, `core/redux/achievement/*`, `component/missions/*`, `component/ach3/modal/ModalMission.tsx`, `component/ach3/page/PageMissions*.tsx`, `component/ach3/page/PageLiquidSection.tsx` |
| Tournaments | `core/engine/TournamentEngine.ts`, `core/redux/tournament/*`, `component/tournament/*`, `component/ach3/tournament/*`, `component/ach3/tournament-new/*`, `component/ach3/page/PageTournament*.tsx` |
| Jackpots | `core/engine/JackpotEngine.ts`, `core/redux/jackpots/*` |
| Raffles / Draws | `core/engine/RaffleEngine.ts`, `core/redux/raffle/*`, `component/ach3/raffle/*` |
| Store / Shop | `core/engine/StoreEngine.ts`, `core/redux/store/*` |
| Inbox / Messages | `core/engine/InboxEngine.ts`, `core/redux/inbox/*`, `core/redux/shortInbox/*`, `component/inbox/*` |
| Levels | `core/redux/levels/*`, `core/engine/UserEngine.ts` |
| SAW / MiniGame / Lootbox | `core/engine/SawEngine.ts`, `component/saw/*` |
| Avatars | `core/engine/AvatarsV2Engine.ts`, `core/redux/avatarsV2/*` |
| Clans | `core/engine/ClansEngine.ts` |
| User profile | `core/engine/UserEngine.ts`, `core/redux/user/*` |
| Bonuses | `core/engine/BonusEngine.ts` |
| LeaderBoards | `core/engine/LeaderBoardEngine.ts` |
| Activity Log | `core/engine/ActivityLogEngine.ts`, `component/activityLog/*` |

## Method-type classifier — how much UI depth?

Not every method needs the full UI matrix. Classify the target method first; produce the matching depth.

| Method shape | Example | UI depth | UI guide file? |
|---|---|---|---|
| **Rich-entity fetch + subscription** | `getMissions({onUpdate})`, `getStoreItems({onUpdate})`, `getTournamentsList({onUpdate})` | **Full**: list bucketing + card + detail popup + action matrix + image specs + animations | **Yes** — write `docs/ui/<domain>/UIGuide_<method>.md` |
| **Rich-entity fetch (no subscription)** | `getBadges()`, `getRaffles({onUpdate})`, `getJackpotWinners` | **Full minus subscription** — same as above but no `onUpdate` lifecycle | **Yes** |
| **Mutation with state-dependent label/branching** | `buyStoreItem`, `requestMissionOptIn`, `claimRafflePrize`, `joinClan` | **Action-focused**: button-states matrix per error code + loading + error-handling UI + idempotency UI guard | **Yes** |
| **Single-entity detail fetch** | `getTournamentInstanceInfo`, `getClanInfo`, `getRaffleDrawRun` | **Detail-focused**: section layout + image specs + state-specific treatments | **Yes** |
| **Metadata / categories** | `getStoreCategories`, `getAchCategories`, `getLevels` | **Light**: rendering hints (sort, translation, fallback), empty state | **Yes — short** (1–2 KB) |
| **Counter / scalar** | `getInboxUnreadCount`, `getCurrentLevel` | **Minimal**: how to render the single value, refresh behavior | **No** — TSDoc only |
| **Fire-and-forget telemetry** | `reportImpressionEvent`, `reportClickEvent` | **None for UI** — focus on call-site placement guidance instead | **No** — TSDoc only |

When a UI guide is written, the method's TSDoc gets the `**UI guidance**: see [UI Guide — `<method>`](../../docs/ui/<domain>/UIGuide_<method>.md).` link line. When not, the TSDoc omits the UI line entirely.

When in doubt, ask: "would a designer reading the docs need to know this to build a screen?" If yes, document it. If no, leave it out.

## Argument handling

- `<method_name>` — a specific SDK method like `requestMissionOptIn`. Skill focuses on that one method end-to-end.
- `<feature_keyword>` — a feature like `missions` or `tournaments`. Skill lists candidate SDK methods in that area and asks the user which to enrich (or processes them in sequence on confirmation).
- No argument — skill scans all `src/WSAPI/WSAPI<Domain>.ts` files for methods with thin TSDoc (single-line description) and presents a candidate list.

## Cost guidance

- Per method: ~$1 hive cost + ~5 minutes wall-clock. Across 50 SDK methods: ~$50 + ~4 hours of operator review time.
- If a method's hive extraction looks unusually short (under 30s) or unusually long (over 5min), that's a signal to re-prompt with more context. Don't accept low-quality output silently.

## Anti-patterns to avoid

- **"Looks good, applying"** without verification — always read at least 2 ach files directly to spot-check hive's claims.
- **Leaving any reviewer-note comments** (`TODO:`, `TODOYY:`, `FIXME:`, `XXX:`, etc.) in the source. Uncertainty goes into the return summary, not into code.
- **Inventing error codes** that hive didn't surface — if hive didn't find a code and validation didn't surface it, the SDK consumer doesn't need to handle it. Don't pad the list.
- **Using `Promise<T>` shape that doesn't match the actual return** — always re-read the method body to confirm what's actually returned, not what feels right.
- **Skipping the validation pass on a "trivial" enrichment** — the first real run found a 5-vs-1 error-code discrepancy. Validation isn't optional.
- **Two @remarks sections covering the same conceptual axis** — e.g. `**Subscription model**` and `**What triggers async refresh**` are both about "what fires updates". Merge into one section with a sub-list, not two. LLMs doing section-level retrieval pull only one and miss the other; human readers skim section headers and lose half the story.
- **Duplicating an error-code table** between the method TSDoc and the result-type field comment — see Discriminator 2 / "Wrapper result types" in the contract section. The method owns the table; the result type's `err_code` field is a one-line pointer.
- **Usage instructions in field comments** — sort/translate/never-cache/always-re-read verbs belong in the method TSDoc, not the field. Field comments answer "what is this"; method TSDocs answer "what do I do with it". See Discriminator 2.
- **Summary that's echoed by an @remarks section verbatim** — the summary is one-line orientation; @remarks add detail. If the summary already says "no opt-in, no claim", don't open a "Differences" section by re-stating "no opt-in, no claim" — start it with the *next* level of detail (what badges DO have, what fields drive behavior instead).
- **Comma-separated prose lists of fields all stating the same predicate** — e.g. "`a`, `b`, `c`, `d`, `e` are not used" is just Discriminator 1 in disguise. Group categorically ("opt-in / claim / recurring fields are not used") so it reads as one fact, not five.

## Capability pages (RAG ingestion) — capture real responses + regenerate

The IDE coding agent does NOT read this repo's raw source or the TypeDoc pages.
It retrieves from **capability pages** — one self-contained markdown doc per
method at `docs/capabilities/<method>.md`, produced by the deterministic
generator `scripts/gen-capabilities.js` (`npm run gen-capabilities`). The
generator stitches: the method TSDoc you just enriched (summary / `@remarks`
contract / `@param` / `@example` / `{@link}` → Related) + the **return type's own
field comments** (per-type resolved, inheritance-aware — so `id`/`name`/`type`
get the right domain's definition) + a **captured REAL response payload**.

**Never hand-edit `docs/capabilities/*.md` — they are generated and overwritten.**
Your job per method is the two inputs the generator can't synthesize: a clean
TSDoc (the rest of this skill) and a captured response.

### Step A — capture the real response shape

The single highest-leverage doc artifact (it removes the agent's ~20-probe
live-SDK fallback). Use the `mcp__hive__run_public_api` MCP tool — it runs the
real `@smartico/public-api` WSAPI server-side, bound to a label+brand+player, and
returns the SAME transformed T-shapes a browser sees. **No user-hash, no browser,
no CORS.** Default test player (env4 — confirm/refresh with the user if rotated):

- `label_api_key`: `a6e7ac26-c368-4892-9380-96e7ff82cf3e-4`
- `brand_api_key`: `f86271e6`
- `user_ext_id`: `4579cace-9069-4d65-93ff-9b8b6c83c45b`

Call the method, slice arrays to **1 representative item**, return it:

```
// code arg to run_public_api:
const r = await api.<method>(<params>);
return Array.isArray(r) ? r.slice(0, 1) : r;
```

Write the result to `docs/capabilities/_responses/<method>.json` (raw array/object
the method returns; the generator trims long strings + re-slices). **Anonymize
before saving**: replace real CDN hosts with `https://cdn.example/...`, GUIDs /
`message_guid` / any user identifier with zero-GUIDs, and trim operator HTML
(tournament/mission `description`) to a short placeholder. Product config (mission
names, store-item names, prize tables) is fine to keep — it's the field *shape*
that matters.

**Caveat — tracker-state methods can't be captured this way.** `getUserProfile`
(and other methods that read tracker state, not a WSAPI roundtrip) return
`"Tracker is not initialized"`. For those few, capture via the headless-browser
fallback: load the SDK on a page (`_smartico('init', LABEL, { brand_key })`),
identify the player, call the method, dump JSON from devtools. Note the method in
the return summary as browser-captured.

### Step B — regenerate + verify

Run `npm run gen-capabilities`, then spot-check the new
`docs/capabilities/<method>.md`:
- **Returns** lists the real fields with the *right* per-domain comments (if a
  field shows another domain's definition, the field-comment collision means the
  return type is missing that field — fix the type, not the page).
- **Behavioral contract** carries your `@remarks` (no empty `(see )` — those mean
  a `{@link}` target the generator couldn't render; usually fine).
- **Example response** shows the real shape.
- No internal leaks surfaced from a type comment (DB tables, `ClassId`, etc.) — if
  one appears, fix the source field comment (it violates the public-contract rule).

Do NOT run `gen-capabilities` as part of an unrelated code change, and do not
commit. It is part of the doc batch (see `api-tsdoc-final`).
