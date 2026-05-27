# UI Guide — `getInboxMessageBody`

## Overview
- Returns the rich body (title, preview, icon, action, html_body,
  buttons, custom_data) for one message identified by its
  `message_guid`.
- Fetched from a CDN, NOT over the WebSocket — latency depends on
  CDN proximity. No SDK-level cache (browser HTTP cache may apply
  via CDN Cache-Control headers).
- Use in two contexts: (a) co-fetched with the envelope list for
  rendering list-row titles + previews, (b) on-demand for a detail
  view.

## Detail view layout

Top-to-bottom layout for a full message detail:

  1. **Icon** — `body.icon` at a larger render size (typically
     128×128 px to match the source). Center-aligned at top.
  2. **Title** — `body.title`, primary heading.
  3. **Body content** — branches on `body.action`:
     - `'dp:inbox'` → render `body.html_body` in a sandboxed
       iframe (see "Rich vs simple" below).
     - any other value → render `body.preview_body` as a formatted
       text block.
  4. **Buttons** — `body.buttons[]` (max 2) — only when
     `action === 'dp:inbox'`. Render side-by-side or stacked
     depending on width.
  5. **CTA** — single primary CTA driving `body.action` when the
     message has no `html_body` (i.e. `action !== 'dp:inbox'`).

## Rich vs simple messages

| `action` value | Shape | Render |
|---|---|---|
| `'dp:inbox'` | Rich: has `html_body`, optional `buttons[]` (max 2) | Sandboxed iframe + button row |
| Anything else (`'dp:gf_missions'`, `'https://...'`, etc.) | Simple: title + preview only | Title + `preview_body` + single CTA wired to `action` |

The transform inside the SDK enforces this — if the underlying CDN
payload has `html_body` or `buttons` but the action isn't
`'dp:inbox'`, those fields are stripped before reaching the SDK
consumer. Don't try to render `html_body` for non-`'dp:inbox'`
messages — it will be `undefined`.

## Sandboxed iframe (for `html_body`)

`html_body` is operator-supplied HTML. **Render in a sandboxed
iframe** to prevent script execution in your host page:

```ts
// Recommended pattern (data: URL, no script execution).
const html = sanitize(body.html_body);
const iframe = document.createElement('iframe');
iframe.sandbox = '';  // no extra permissions
iframe.srcdoc = html;
container.appendChild(iframe);
```

The default Smartico UI uses an injected ResizeObserver script to
auto-size the iframe height to its content. If you replicate this,
include the script inside `srcdoc` (not as a sandbox permission) so
the host page stays isolated.

Wrap any deep-links found inside the HTML body with a click handler
that calls `_smartico.dp(href)` rather than letting the native
navigation execute — this keeps deep-link routing consistent.

## Action button decision matrix

| Condition | Button label | Click behavior |
|---|---|---|
| `body.action === 'dp:inbox'` AND no `buttons` | (no top-level CTA) | Action buttons (if any) are the primary affordances. The "open this message" deep-link is satisfied by being in the detail view already. |
| `body.action === 'dp:inbox'` AND `buttons` non-empty | Render each `button.text` | Click handler executes `_smartico.dp(button.action)` AND fires {@link reportClickEvent} with `action: button.action`. |
| `body.action !== 'dp:inbox'` (simple message) | Single CTA (operator usually puts text in `preview_body`; consumer may default to "Open") | Click handler executes `_smartico.dp(body.action)` AND fires {@link reportClickEvent} with `action: body.action`. |

The default Smartico UI does NOT render an explicit "Close" or
"Back" button inside the detail body — modal/sheet chrome handles
that.

## Telemetry pairing

- Fire {@link reportImpressionEvent} when the detail view opens (or
  the message first becomes visible).
- Fire {@link reportClickEvent} when any action button or CTA is
  tapped. Pass the deep-link / URL as the `action` argument so
  operator analytics can attribute the click to the specific link.

## `custom_data`

Operator-defined per-message data. The SDK auto-parses
JSON-looking strings, so at runtime `custom_data` is `any` despite
the `string` type. Guard with `typeof custom_data === 'object'`
before property access; treat non-object values as raw strings.

Common consumer patterns:
- A custom badge / category-color derived from a `custom_data.tag`
  field.
- A deep-link override for specific message types.
- Operator-defined A/B variant identifier.

## Empty / loading / error states

- **Loading**: render a skeleton block in the detail panel — icon
  placeholder, title placeholder, 3–4 lines of preview placeholder.
- **Error**: CDN fetch failures should fall back to displaying the
  envelope's `sent_date` and a "Message body unavailable, please
  try again" placeholder. Allow retry.

## Animations / transitions

- **Detail open (mobile inline)**: 0.5 s height transition.
- **Detail open (desktop panel)**: 150 ms fade.
- **Iframe height adjust** (rich body): smooth height transition
  via ResizeObserver — avoid jitter on small content changes.

## Mobile vs desktop

- **Modal style**: mobile inline expand or full-screen sheet;
  desktop right-panel.
- **Icon size**: desktop ~128 px; mobile may scale down to 64 px
  to save vertical space.
- **Button layout**: side-by-side on desktop; stacked on mobile
  for thumb reach.

## Performance

- Each call is a CDN HTTP GET. For a list of 20 messages, parallel
  body fetches via `Promise.all()` complete in roughly one CDN
  round-trip time.
- Cache bodies in your application state — the SDK does not cache
  them, and re-opening a message would otherwise refetch.
- Browser HTTP cache (Cache-Control from the CDN) provides some
  free caching on repeat fetches within a session.
