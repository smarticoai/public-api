# UI Guide — `getJackpotWinners`

## Overview
- Paginated list of past winners of a specific jackpot template.
- Powers the "Recent Winners" / "Win History" tab inside the jackpot
  detail modal.
- 30 s cache per page (template + `limit`/`offset`).
- Gated by the operator's `expose_winners_over_api` flag — but only on
  the client side. Custom UIs must check this flag before calling.

## Gating — respect `expose_winners_over_api`

The server does NOT enforce this flag. The consumer is responsible for
honoring the operator's choice:

```ts
const [jp] = await window._smartico.api.jackpotGet({ jp_template_id });

if (!jp || !jp.expose_winners_over_api) {
  console.log('[smartico] winners hidden by operator — hide the winners tab');
  return;
}

const winners = await window._smartico.api.getJackpotWinners({ jp_template_id });
```

Failing to check the flag will display winners on widgets where the
operator intended to keep them private.

## List view organization

Server-sorted newest-first. No client-side sort needed. Pagination via
`limit` (default 20) and `offset`. For infinite scroll, advance `offset`
by `limit` per page.

## Item row

| Field | Source | Notes |
|---|---|---|
| Win date | `win_date_ts` | Unix ms; format as `DD/MM/YYYY · HH:mm` or relative |
| Username | `winner.public_username` | May be partially masked by operator settings |
| Avatar | `winner.avatar_url` | 32–40 px square |
| Amount | `winner.winning_amount_jp_currency` | **In jackpot's native currency, NOT user currency** |
| Currency | `jp_currency` from the parent `JackpotDetails` | Pair with the amount field |

## Currency caveat

Amounts here are in the jackpot's native currency (`jp_currency` on the
parent `JackpotDetails`), NOT in the user's wallet currency. If the
display needs the user-currency equivalent, the consumer must convert
client-side using the exchange rate available on the platform.

## Empty / loading / error states

- **Empty (page 0)**: "No winners yet — be the first!"
- **Empty (subsequent pages)**: end-of-list — stop pagination.
- **Loading (cold fetch)**: skeleton row list (3–5 placeholders).
- **Error**: keep prior list if any; non-blocking banner.

## Refresh

- 30 s SDK cache per page — keyed by `jp_template_id` + `limit` +
  `offset`, so each page is cached independently.
- Cache clears on jackpot-win push events — when the pot explodes, the
  new winner row appears on the next call.
- Cache also clears on opt-in / opt-out.

## Animations / transitions

- New winner row (after a jackpot-win push) — fade-in or pulse at the
  top of the list.
- Skeleton rows during initial load.

## Mobile vs desktop

- **Mobile**: full-width rows with avatar left, amount right.
- **Desktop**: same layout, max-width centered modal.

## Performance

- 30 s cache absorbs rapid tab switches.
- Paginate via `limit`/`offset` — default `limit: 20` is typically
  sufficient.
- Don't pre-fetch — the winners tab is opened on demand.
