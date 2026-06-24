# getMiniGamesHistory — API (TSawHistory)

> Returns a paginated, newest-first list of the user's past mini-game spins — each row carries the won prize ID, the client-side `request_id` used for the spin, and a server-recorded `is_claimed` flag (`true` if the spin has been acknowledged).
> Import: `import { TSawHistory } from '@smartico/public-api'`
> Search terms: getMiniGamesHistory, minigames, TSawHistory

## Signature
```ts
_smartico.api.getMiniGamesHistory({
		limit,
		offset,
		saw_template_id,
	}: {
		limit?: number;
		offset?: number;
		saw_template_id?: number;
	}): Promise<TSawHistory[]>
```

## Parameters
- `params` — Optional pagination + filter bag.
- `params.limit` — Page size. Defaults to 20.
- `params.offset` — Number of rows to skip. Defaults to 0.
- `params.saw_template_id` — When set, scopes the history to a single template's spins.

## Returns — `Promise<TSawHistory[]>`
Array of `TSawHistory`. Each item (shape from the type — capture a response into `_responses/` for a real example):
- `template` (SAWTemplate) — The initial information about mini-game
- `saw_template_id` (number) — ID of the mini-game template
- `saw_prize_id` (number) — The saw_prize_id that user won, details of the prize can be found in the mini-game definition
- `prize_amount` (number) — Amount of prizes in stock
- `client_request_id` (string) — Request ID that client is sending to show history
- `is_claimed` (boolean) — Flag indicating to show whether prize in the mini-game claimed or not
- `create_date_ts` (number) — Win prize date in milliseconds
- `acknowledge_date_ts` (number) — Claimed prize date in milliseconds

## Behavioral contract
**Pagination**
`limit` defaults to 20, `offset` defaults to 0. Sort order is
`create_date` DESC (newest first) — no client-side re-sort
required. For "load more" pagination, advance `offset` by the
page size on each subsequent call.

The underlying protocol carries a `hasMore` boolean on the
response, but the SDK strips it from the public surface —
detect end of list when the returned array length is less than
`limit`.

**`is_claimed` semantics**
Maps directly to the server's "acknowledge_date is non-null"
state. A spin where the auto-acknowledge fire-and-forget
succeeded shows `is_claimed: true`; a spin where the
acknowledge was lost (network drop) or where the user is on an
explicit-acknowledge flow shows `is_claimed: false` with a
usable `client_request_id`. A server-side fallback job
auto-acknowledges stale rows every ~60 seconds — so even
"lost" prizes are eventually delivered without consumer action.

**Cache TTL**: the SDK caches the response for 30 seconds.
Cache is invalidated implicitly when a new spin or acknowledge
response lands.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getMiniGamesHistory`](../../docs/ui/minigames/UIGuide_getMiniGamesHistory.md).

**Visitor mode**: not supported.

## Example
```ts
const history = await window._smartico.api.getMiniGamesHistory({ limit: 20 });

// Show unacknowledged spins with a Claim CTA.
const unacknowledged = history.filter(h => !h.is_claimed);
console.log('[smartico] surface a "Claim" CTA on these', unacknowledged.length, 'history rows:',
  unacknowledged.map(h => h.client_request_id));

// Load-more pagination — advance offset by the prior page size.
const page2 = await window._smartico.api.getMiniGamesHistory({ limit: 20, offset: 20 });
console.log('[smartico] page 2 loaded —', page2.length, 'more rows;',
  page2.length < 20 ? 'end of list reached, hide "Load more"' : 'keep "Load more" visible');
```

### Example response (REAL shape)
```json
[
  null
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `miniGameWinAcknowledgeRequest`
