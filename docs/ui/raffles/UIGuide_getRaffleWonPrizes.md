# UI Guide — `getRaffleWonPrizes`

## Overview
- Powers a **"my prizes" screen** for a single raffle — the flat list of
  every prize the current user has won across all of that raffle's draws,
  newest-won first.
- One-shot, paginated fetch. No cache, no subscription. Re-call to refresh
  (e.g. after a [`claimRafflePrize`](../../api/classes/WSAPIRaffles.md#claimraffleprize)).
- Each row already carries `public_meta.name` + `public_meta.image_url`, so
  you can render full prize cards without a follow-up
  [`getRaffleDrawRun`](../../api/classes/WSAPIRaffles.md#getraffledrawrun) call.

## List view organization

- Single flat list (no per-draw grouping), ordered newest-win first.
- There is **no** server-side "unclaimed first" ordering. If your design
  surfaces actionable prizes at the top, sort client-side by
  `requires_claim && !claimed_date`, then keep the server order within each
  group.
- Drive "load more" off `total` (the full win count across all draws), not
  off the page length:

```ts
const hasMore = page.offset + page.won_prizes.length < page.total;
console.log('[smartico] more pages?', hasMore);
```

## Item card / tile

One card per `won_prizes[]` row:

| Element | Source | Notes |
|---|---|---|
| Prize image | `public_meta.name` → `public_meta.image_url` | Square artwork; the default Smartico UI renders it as a circular icon. |
| Prize name | `public_meta.name` | Localised. Truncate long names (~30 chars) with an ellipsis. |
| Claimed / Claim CTA | `requires_claim` + `claimed_date` | See the action matrix below. |
| Won-by attribution | `user.public_username` / `user.avatar_id` | The list belongs to one user; usually shown once in the header, not per card. |

## Action button decision matrix

Per row:

| `requires_claim` | `claimed_date` | Render |
|---|---|---|
| `false` | (any) | No CTA — prize was auto-delivered. Optionally show a "Delivered" tag. |
| `true` | `null` | **Claim** button. On click call `claimRafflePrize({ won_id: prize.raf_won_id })` — `raf_won_id` IS the `won_id`. |
| `true` | epoch ms | No CTA — show a "Claimed" tag (optionally with the claimed date). |

```ts
const canClaim = prize.requires_claim && !prize.claimed_date;
if (canClaim) {
  console.log('[smartico] show Claim — on click: claimRafflePrize({ won_id:', prize.raf_won_id, '})');
}
```

Guard the Claim button against double-clicks (set an in-flight flag on click).
A second claim of an already-claimed prize is rejected server-side. After a
successful claim, re-call `getRaffleWonPrizes` to pick up the new
`claimed_date` (this method has no `onUpdate`).

## User attribution (avatar + username)

The `user` object describes whose prizes these are.

- **Null-check `user` first** — it is `null` when `won_prizes` is empty.
- **Avatar**: use `user.avatar_id`. If it already starts with `http`, use it
  directly as the `<img src>`. Otherwise it is an avatar token — prepend the
  widget's configured avatar domain (`{avatarDomain}/avatar/{avatar_id}`).
  `user.avatar_url` is always `null`; ignore it. `user.avatar_real_id`
  identifies the avatar definition internally and is not used for rendering.
- **Username**: `user.public_username` is server-masked for privacy (e.g.
  `"32:r*****"`). Render it verbatim. For the current user, show a localised
  "You" label instead of the masked string.

## Image / asset specs

- Prize image (`public_meta.image_url`): square (1:1) CDN artwork. The default
  Smartico UI renders it at 40×40 px with `border-radius: 50%`.
- Provide a letter/placeholder fallback when `image_url` is empty.

## Empty / loading / error states

- **Loading**: show a card skeleton grid while the call is in flight.
- **Empty** (`errCode === 0` and `won_prizes.length === 0`): render an empty
  state ("No prizes won yet"). Note this is *also* the response when the user
  is not eligible to see the raffle — the two are indistinguishable, so keep
  the copy neutral.
- **Error** (`errCode !== 0`): keep any prior snapshot; show a non-blocking
  error banner with a retry. `errCode` is `1` for all server errors —
  surface `errMsg` if present.

## Refresh / polling

- One-shot promise; no client cache; no push refresh.
- Re-call on screen open, on explicit "load more", and after a successful
  `claimRafflePrize`.
- **Do not poll on a timer** — the server rate-limits this call (~30/min, with
  a ~5 s minimum gap between calls). Tight polling will start failing.

## Pagination

- `offset` / `limit` page the rows; the SDK defaults to `0` / `20`.
- The server does **not** clamp `limit` — pass an explicit, sane page size.
- An `offset` past the end returns an empty page with the real `total` and
  `errCode 0` (not an error).
- For "load more": advance `offset` by your page size each call.

## Mobile vs desktop

- Desktop: multi-column card grid. Mobile: single-column list or compact
  2-column grid.
- The response shape is identical across viewports; only layout density
  differs.

## Performance

- Each call is a fresh network round-trip. Fetch one page at a time and append
  on "load more" rather than pre-fetching all pages.
- The server caches responses briefly, so a quick re-open is cheap — but the
  rate limit still applies; debounce rapid re-fetches.
