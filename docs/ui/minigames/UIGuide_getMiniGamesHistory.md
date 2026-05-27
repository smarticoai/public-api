# UI Guide — `getMiniGamesHistory`

## Overview
- Paginated, newest-first list of past spins. Each row carries the
  won prize ID, the spin's `client_request_id`, an `is_claimed`
  flag, and the template that produced it.
- Use to power a "My prizes" / win-history surface, and to surface
  Claim CTAs on unacknowledged spins (`is_claimed === false`).
- 30 s cache. No subscription / push refresh.

## List view organization

Single flat list, server-sorted newest-first by spin creation
timestamp. No client-side re-sort required. No tabs in the default
Smartico UI — but a custom UI might tab by:

- "Claimed" vs "Unclaimed" (filter by `is_claimed`)
- Per-template (use `saw_template_id` filter argument)

## Item card / row

Fields rendered per row:

| Field | Source | Notes |
|---|---|---|
| Template icon | `template.thumbnail` (or similar) | 1:1 |
| Prize name | Look up `template.prizes[i]` by `saw_prize_id` | Display the prize's `name`. |
| Prize amount | `template.prizes[i].prize_value` or `prize_amount` | E.g. "100 points" |
| Spin date | `create_date_ts` | Format as user-local relative time ("2h ago") or short date |
| Claim status | `is_claimed` | Show check-mark when true; "Pending claim" CTA when false |
| Acknowledge date | `acknowledge_date_ts` | Only when `is_claimed === true` |

**Click target**: typically opens the template detail / play view
(to "play again" or read prize terms). Optional.

## Action button — Claim CTA on unacknowledged rows

When `is_claimed === false`, render a "Claim" button:

```ts
const onClaimHistoryRow = async (row: TSawHistory) => {
  await window._smartico.api.miniGameWinAcknowledgeRequest(row.client_request_id);
  console.log('[smartico] re-acknowledged spin — refresh history list to flip is_claimed');
  const refreshed = await window._smartico.api.getMiniGamesHistory({ limit: 20 });
  // ...
};
```

Note: a server-side fallback job auto-acknowledges stale spins
every ~60 seconds, so unclaimed rows usually self-resolve without
explicit user action. The manual Claim CTA is for instant recovery
when the user is actively viewing the history surface.

## Pagination

`limit` defaults to 20; `offset` defaults to 0. For load-more
pagination, advance `offset` by the prior page size. Detect end of
list when the returned array length is less than `limit`.

`saw_template_id` filter scopes to a single template's history —
useful for a per-game "previous wins" panel.

## Empty / loading / error states

- **Loading (cold fetch)**: skeleton list (3–5 placeholder rows).
- **Empty**: "No mini-game history yet" with optional illustration.
- **Empty (filtered)**: "No history for this game".
- **Error**: keep prior list if any; non-blocking error banner.

## Refresh

No subscription / push refresh. Re-call after:

- A successful `playMiniGame` / `playMiniGameBatch` to surface the
  new row at the top.
- A successful `miniGameWinAcknowledgeRequest` to flip `is_claimed`.

The 30 s cache deduplicates rapid refetches.

## Mobile vs desktop

- **Row density**: identical on both.
- **Claim CTA**: inline button on each row (both platforms).

## Performance

- The 30 s cache helps when the user navigates between tabs and
  re-renders the history.
- Don't over-fetch — limit to 20–50 rows per page.
- Filter by `saw_template_id` when the surface is per-template.
