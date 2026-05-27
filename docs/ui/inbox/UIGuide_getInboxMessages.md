# UI Guide — `getInboxMessages`

## Overview
- Returns the lightweight `TInboxMessage[]` envelopes — newest first.
- For each visible message, fetch the rich body via
  [`getInboxMessageBody`](../../api/classes/WSAPIInbox.md#getinboxmessagebody)
  separately. The list type alone is NOT enough to render the title
  / preview / icon.
- `onUpdate` fires only when a NEW message is pushed by the server.
  Mutations (`markRead`, `favorite`, `delete`) do NOT auto-refresh
  the list — re-call or update local state.

## List view organization

The default Smartico UI presents inbox messages in a **single
scrollable list** with two filter tabs at the top:

| Tab | Filter |
|---|---|
| **All** | No filter — all messages |
| **Favorite** | `onlyFavorite: true` |

`InboxCategories` (`General` / `Platform` / `Personal`) and
`InboxReadStatus` are exposed via the SDK but NOT surfaced as tabs in
the default UI. Custom UIs may add them as additional tabs or filter
chips.

**Sort order**: server-driven, newest `sent_date` first. No
client-side re-sort.

**Pagination**: 20 messages per page. For load-more pagination,
advance `from` by 20 on each subsequent call.

## Item card / row

Fields rendered per row (combining `TInboxMessage` envelope with
the pre-fetched `TInboxMessageBody`):

| Field | Source | Notes |
|---|---|---|
| Icon | `body.icon` (128×128 px) | CSS `background-image`. Fallback to a generic message icon if missing. |
| Title | `body.title` | Primary text. |
| Preview | `body.preview_body` | Single-line excerpt. |
| Sent date | `envelope.sent_date` | Render as relative time ("2h ago", "Yesterday", "12 Jun"). |
| Unread dot | `envelope.read === false` | Filled colored dot. Hide when read. |
| Favorite star | `envelope.favorite` | Filled star icon when favorited; outline otherwise. |
| Delete affordance | hover (desktop) / swipe (mobile) | See "Delete UX". |
| "Read more" link | shown when `body.html_body` exists | Triggers inline expand. |

**The list needs pre-fetched bodies** — call
[`getInboxMessageBody`](../../api/classes/WSAPIInbox.md#getinboxmessagebody)
for each envelope before rendering. The default Smartico UI batches
these fetches alongside the list. Cache bodies in your application
state to avoid re-fetching on scroll.

## Detail view / expand

Two rendering modes per device:

- **Mobile / widget**: tap the row → message body expands inline
  (CSS transition ~0.5 s). The `html_body` (if present) is rendered
  in a sandboxed iframe with auto-resizing height.
- **Desktop full-page**: a right-side detail panel renders the
  selected message; the first message auto-opens.

Detail-view content top-to-bottom:

  1. Icon (larger size).
  2. Title.
  3. Either the rich `html_body` (in a sandboxed iframe) OR a
     formatted `preview_body` block, depending on whether
     `body.action === 'dp:inbox'`.
  4. Up to 2 action buttons (`body.buttons`) — only when
     `action === 'dp:inbox'`.
  5. Single CTA (when `body.action` is a deep-link / URL other than
     `'dp:inbox'`).

**Sandbox the iframe**: the `html_body` is operator-supplied content.
Render via `<iframe srcdoc>` or a sandboxed `<iframe>` to prevent
script injection into your host page.

## Auto-mark-as-read

The default Smartico UI auto-marks-read when the message detail
expands (or auto-opens on desktop). Wire it alongside the
{@link reportImpressionEvent} call so a single user action fires
both the read mutation and the impression analytic.

If you build a viewport-based "auto-read-on-scroll" instead, set a
threshold (e.g. row visible in viewport for ≥500 ms) — instant
mark-on-scroll generates noisy impressions.

## Favorite toggle

Inline star icon click handler:

```ts
const onToggleFavorite = async (msg: TInboxMessage) => {
  const target = !msg.favorite;
  console.log('[smartico] optimistically flip star to', target);
  const r = await window._smartico.api.markUnmarkInboxMessageAsFavorite(
    msg.message_guid,
    target,
  );
  if (r.err_code !== 0) {
    console.error('[smartico] favorite failed — revert local state and show error toast:', r.err_message);
  }
};
```

Show a brief "Added to favorites" / "Removed from favorites" toast
on success.

## Delete UX

| Trigger | Platform |
|---|---|
| Trash-icon click (visible on hover) | Desktop |
| Swipe left/right past threshold (~75 px) | Mobile |
| Delete button in detail panel | Desktop full-page |

**No confirm dialog** for single-message delete — the action is
fast. Animate the row out of the list (~300 ms slide), then call
{@link deleteInboxMessage}. Show "Message deleted" toast.

For **mark-all** / **delete-all** mutations, surface a confirm dialog
(those operations are destructive at scale).

## Image / asset specs

| Field | Recommended source | Aspect | Fallback |
|---|---|---|---|
| `body.icon` | 128×128 px | 1:1 (square) | Generic message-icon placeholder |
| `body.html_body` images | (operator-supplied) | (any) | Iframe sandbox handles broken images |

## Empty / loading / error states

- **Loading**: render a skeleton list (5–8 placeholder rows).
- **Empty (all)**: Lottie animation + "No messages yet…" copy.
- **Empty (favorite filter active)**: "No favorite messages".
- **Empty (unread filter active)**: "No unread messages".
- **Error**: keep prior list visible if any; show non-blocking error
  banner; retry on next user action.

## Animations / transitions

- **List entry**: stagger fade-in (~30 ms per row) on first render.
- **New message arrival**: when a push fires `onUpdate`, insert the
  new row at the top with a slide-in animation (~200 ms).
- **Detail expand (mobile)**: 0.5 s height transition; iframe height
  adjusts via ResizeObserver.
- **Delete**: 300 ms slide-out + height collapse.
- **Mark-as-read**: unread dot fades from opacity 1 to 0.

## Refresh

`onUpdate` fires ONLY on new-message pushes. After any of the
mutation methods:

- Update local state optimistically (flip `read`/`favorite`, drop
  the row from the list).
- The unread badge auto-updates via
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
  `core_inbox_unread_count` (push-driven) — no need to manually
  refresh the count.
- Re-call `getInboxMessages` only if you need the server-canonical
  view (e.g. after a long offline period).

## Mobile vs desktop

- **Layout**: mobile is full-width single column with inline detail
  expand; desktop is 50/50 list + detail split panel.
- **Detail trigger**: mobile = inline expand; desktop = right
  panel with auto-open.
- **Delete**: mobile = swipe; desktop = hover trash-icon.
- **Favorite**: mobile = always-visible star; desktop =
  hover-visible.

## Performance

- 20 messages per page keeps payloads small. For very long inboxes,
  use the load-more pattern rather than fetching everything.
- Body fetches are CDN HTTP GETs — batch them in parallel using
  `Promise.all()` for the initial list.
- Cache message bodies in application state — the SDK does NOT
  cache them, and re-opening a message would otherwise refetch.
