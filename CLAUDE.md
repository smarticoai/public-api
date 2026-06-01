# public-api (`@smartico/public-api`)

Smartico's public WebSocket SDK. This code is compiled (by the `tracker`
repo's Rollup) straight into the browser bundles served from CloudFront —
**every line here ships to end users' browsers.**

## Conventions / footguns

- **Keep code compact — it's bundle size.** This SDK is shipped to the
  browser, so added code is added download weight for every end user. Prefer
  the smallest implementation that does the job:
  - **Don't write a transform that is ~1:1 with the wire shape.** If a
    protocol response is already the shape consumers need, expose the
    `…Response` protocol type directly instead of defining a parallel `T…`
    interface plus a `…Transform()` mapper. Reserve transforms for cases
    that genuinely reshape, flatten, rename, or compute (e.g.
    `raffleTransform`, `drawRunTransform`).
  - Don't add parallel type hierarchies, defensive copies, or wrapper layers
    that don't earn their bytes.
  - Favor reusing existing helpers/types over introducing near-duplicates.
  - TSDoc/comments are stripped from the bundle — document generously; it's
    only runtime code that counts against size.

## Documentation (`docs/`)

The SDK ships a documentation set under `docs/`. It mixes **TypeDoc-generated
reference** with **hand-authored concept/guide docs**. Build wiring lives in
`package.json` (the `doc` script) and `tsconfig.json` (`typedocOptions`).

### Layout — what is generated vs hand-authored

| Path | Created by | What it is |
|---|---|---|
| `docs/api/` | **Generated** by `typedoc` | The API reference — one page per WSAPI class / interface / enum / type / function, built from the TSDoc in `src/`. Subfolders: `classes/`, `interfaces/`, `enumerations/`, `type-aliases/`, `functions/`, `variables/`, `documents/`. Wiped and rebuilt on every `npm run doc` (`cleanOutputDir: true`). **Never hand-edit — changes are overwritten.** To add a page, add the source `.ts` to `typedocOptions.entryPoints` in `tsconfig.json`; never hand-create the `.md`. |
| `docs/ui/<domain>/UIGuide_<method>.md` | Hand-authored | Per-method UI guidance (rendering patterns, polling cadence, CTA gating). Method TSDoc links here via a relative `[UI Guide](../../docs/ui/...)` reference instead of inlining long UI prose. One folder per domain (`raffles`, `store`, `missions`, …). |
| `docs/SmarticoObject.md` | Hand-authored | Reference for the global `_smartico` object's **core** methods (`init`, identify, deep links, widget embedding, push). Sourced from the tracker repo's `../tracker/src/tracker/Smartico.ts` — these methods live in the tracker, not here. |
| `docs/Callbacks.md` | Hand-authored | The `_smartico.on(...)` lifecycle/engagement event catalogue. Sourced from the tracker's external-callback enum + its `triggerExternalCallBack` sites. |
| `docs/Transforms.md` | Hand-authored | Concept doc for the raw-protocol → friendly-`T`-type transform layer (the `T`-type / `*Transform` fn / `*T` method convention described above). |
| `docs/native/PROTOCOL.md`, `docs/native/ADDING_METHODS.md` | Hand-authored | Raw WebSocket protocol spec for native (Kotlin/Swift) clients, which speak the wire directly and do **not** get the JS transforms. Documents raw request/response shapes + `ClassId`s — the one place `ClassId` values are allowed in docs. |

The three concept docs (`SmarticoObject.md`, `Callbacks.md`, `Transforms.md`)
are wired into TypeDoc via `typedocOptions.projectDocuments`, so they render
inside the generated `docs/api` site alongside the reference.

### Build

- `npm run doc` = `typedoc && node scripts/postdoc-cleanup.js`.
- `typedoc` is driven entirely by `typedocOptions` in `tsconfig.json`:
  `entryPoints` (the `src/**` files whose exports become reference pages —
  **add new public types/classes here or they won't appear in `docs/api`**),
  `out: docs/api`, `projectDocuments`, the markdown + merge-modules plugins, and
  flags (`excludePrivate`, `excludeProtected`, `disableSources`,
  `cleanOutputDir`, …).
- `scripts/postdoc-cleanup.js` post-processes what TypeDoc can't configure away:
  strips inheritance-chain "Extends / Extended by" blocks, strips methods
  duplicated onto every subclass by the prototype chain, and rewrites the
  `_media/`-copied UI-guide links back to `docs/ui/` (single source of truth).
- **`npm run doc` is human-triggered after a batch of approved doc edits — do
  not run it as part of a code change, and never edit `docs/api/**` by hand.**

### Authoring rules (from the `api-tsdoc` / `api-tsdoc-final` skills)

These docs are the **public SDK contract** read by 3rd-party integrators, so all
TSDoc and concept-doc content is strictly consumer-facing:

- **No internal references** in `/** */` blocks or concept docs: no DB
  schemas/tables, server class/file refs, `ClassId` values (except in
  `PROTOCOL.md`, the raw spec), internal enum/status numbers, cache/infra names,
  Jira refs, or BO admin paths. Describe *behavior*, not implementation. Call
  the in-tracker reference UI **"the default Smartico UI."**
- **Type docs vs method docs split.** `WSAPITypes.ts` field comments are terse
  one-line definitions ("what is this field"); the `WSAPI<Domain>.ts` method
  TSDoc carries narrative usage prose ("what you do with it" — preconditions,
  error tables, refresh/cache semantics, idempotency, visitor mode). Don't
  duplicate a field-by-field reference into the method TSDoc.
- **Wrapper result types** (`err_code` / `err_message`) get a one-line pointer
  to the owning method's TSDoc, not a duplicated error table.
- `@example` blocks use `console.log` / `console.error` with descriptive
  messages stating what the consumer's UI should do — never pseudo-handlers
  (`toast`, `showError`) or internal types.
- `/api-tsdoc <method>` enriches one method (+ its UI guide); `/api-tsdoc-final`
  runs the whole release doc batch (callbacks, `_smartico` object, native
  protocol, transforms, method TSDocs) and stops at a prepared commit message.
  Both **never commit and never run `npm run doc`.**

### Relationship to the `tracker` repo (`../tracker`)

This package is published to npm as `@smartico/public-api` and **consumed** by
the sibling `../tracker` repo, which is what actually ships to browsers. In
`../tracker/src/tracker/Smartico.ts` the tracker constructs a `SmarticoAPI` and
exposes its `getWSCalls()` result as `_smartico.api` (the `WSAPI` surface these
docs document), plus a visitor-mode `_smartico.vapi`. Consequences:

- The `docs/api` reference documents exactly the `_smartico.api.*` methods the
  tracker re-exports. A method added here (e.g. `getRaffleWonPrizes`) reaches
  `_smartico.api` only once the tracker bumps its dependency
  (`npm run bump-tracker`, i.e. `npm install @smartico/public-api@latest` in
  `../tracker`) and re-bundles.
- `docs/SmarticoObject.md` documents the *other* half — the core `_smartico.*`
  methods that live in the tracker's `Smartico.ts`, not in this repo. Keeping it
  current means reading that tracker file (the `api-tsdoc-final` batch diffs it).
- `docs/Callbacks.md` likewise tracks the tracker's external-callback enum and
  emit sites.
