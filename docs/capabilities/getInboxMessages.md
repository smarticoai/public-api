# getInboxMessages — API (TInboxMessage)

> Returns the user's inbox messages — newest first — with optional filtering by category, favorite status, and read state.
> Import: `import { TInboxMessage } from '@smartico/public-api'`
> Search terms: getInboxMessages, inbox, TInboxMessage, InboxCategories, onUpdate, subscription, sent_date, message_guid, read, favorite, category_id, expire_on_dt

## Signature
```ts
_smartico.api.getInboxMessages({
		from,
		to,
		onlyFavorite,
		categoryId,
		read_status,
		onUpdate,
	}: {
		from?: number;
		to?: number;
		onlyFavorite?: boolean;
		categoryId?: InboxCategories;
		read_status?: InboxReadStatus;
		onUpdate?: (data: TInboxMessage[]) => void;
	} = {}): Promise<TInboxMessage[]>
```

## Parameters
- `params` — Optional filters + subscription.
- `params.from` — First message index (0-based). Defaults to `0`.
- `params.to` — Last message index (exclusive). Defaults to `20`. Server caps the page at 20.
- `params.onlyFavorite` — When `true`, returns only favorite (starred) messages.
- `params.categoryId` — When set, returns only messages in this category (`InboxCategories`).
- `params.read_status` — When set, scopes to read or unread only (`InboxReadStatus`).
- `params.onUpdate` — Callback invoked with the full refreshed list when a new message arrives.

## Returns — `Promise<TInboxMessage[]>`
Array of `TInboxMessage`. Each item:
- `message_guid` (string) — Unique identifier of the message. Pass to `getInboxMessageBody` and the mark / favorite / delete mutations.
- `sent_date` (string) — Date-time the message was sent, as a `"dd/MM/yyyy HH:mm:ss"` string (server local — NOT ISO-8601, so `new Date(sent_date)` will not parse it).
- `read` (boolean) — `true` when the message has been marked read.
- `favorite` (boolean) — `true` when the message has been starred (favorited).
- `category_id` (InboxCategories) — Operator-assigned category (`InboxCategories`).
- `expire_on_dt` (number) — Expiry timestamp as Unix-ms epoch. Server filters out expired messages from list responses — consumers rarely see this set unless the expiry is upcoming.

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed message list (never a
diff/patch). Each subsequent call to `getInboxMessages({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — the callback fires ONLY when:

1. A new message is pushed by the server (campaign / automation /
 operator send). The refreshed list includes the new message
 at the top.

Does NOT fire for: `markInboxMessageAsRead`,
`markAllInboxMessagesAsRead`,
`markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`,
`deleteAllInboxMessages`. After a mutation, re-call
`getInboxMessages` manually if your UI needs the refreshed list
— or maintain optimistic state locally.

**Pagination**
`from` (defaults to `0`) and `to` (defaults to `20`) define a
half-open range of message indices. The server caps the page at
**20 messages per request** — passing `to - from > 20` silently
truncates to 20. For "load more" pagination, advance `from` by
the prior page size on each subsequent call.

**Filters**
All filters are ANDed server-side. Omitting a filter means "no
constraint" on that dimension:
- `categoryId` (`InboxCategories`): `General` (0),
 `Platform` (1), `Personal` (2). Omit to get all categories.
- `onlyFavorite: true` returns only starred messages.
 Omit / `false` returns all (starred and not).
- `read_status` (`InboxReadStatus`): `UnreadOnly` (1) or
 `ReadOnly` (2). Omit to get both.

**Server-side filtering** (always applied)
Expired messages (`expire_on_dt` in the past) and
soft-deleted messages are excluded server-side. Consumers do not
need to filter for these.

**No client cache**: every call sends a fresh server round-trip.
To avoid redundant fetches in your UI, hold the result in
application state and re-fetch on `onUpdate` fires or explicit
user-driven refresh.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getInboxMessages`](../../docs/ui/inbox/UIGuide_getInboxMessages.md).

**Visitor mode**: not supported.

## Example
```ts
const messages = await window._smartico.api.getInboxMessages({
  onUpdate: (refreshed) => {
    console.log('[smartico] new inbox message arrived — re-render the list from this array, new message is at index 0:', refreshed);
  },
});

// For each message, fetch its body for the list view (title, preview, icon).
for (const msg of messages) {
  const body = await window._smartico.api.getInboxMessageBody(msg.message_guid);
  console.log('[smartico] render message', msg.message_guid,
    '— title:', body.title,
    '— preview:', body.preview_body,
    '— read:', msg.read,
    '— favorite:', msg.favorite);
}

// "Load more" pagination — advance from by the prior page size.
const page2 = await window._smartico.api.getInboxMessages({ from: 20, to: 40 });
console.log('[smartico] page 2:', page2.length, 'messages');

// Filter examples.
const onlyStarred = await window._smartico.api.getInboxMessages({ onlyFavorite: true });
const onlyUnread = await window._smartico.api.getInboxMessages({ read_status: 1 });  // InboxReadStatus.UnreadOnly
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "sent_date": "24/06/2026 07:43:31",
    "message_guid": "00000000-0000-0000-0000-000000000000",
    "read": true,
    "favorite": false,
    "category_id": 0,
    "expire_on_dt": 1784879011491
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getInboxMessageBody`
- `InboxCategories`
- `InboxReadStatus`
