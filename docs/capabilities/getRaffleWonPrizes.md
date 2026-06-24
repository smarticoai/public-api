# getRaffleWonPrizes — API (GetRaffleWonPrizesResponse)

> Returns every prize the current user has won within a single raffle — across ALL of that raffle's draws, newest-won first — in one paginated call.
> Import: `import { GetRaffleWonPrizesResponse } from '@smartico/public-api'`
> Search terms: getRaffleWonPrizes, raffles, GetRaffleWonPrizesResponse, RaffleWonPrizeUser, RaffleWonPrize, RaffleWonPrizePublicMeta

## Signature
```ts
_smartico.api.getRaffleWonPrizes(props: { raffle_id: number; offset?: number; limit?: number }): Promise<GetRaffleWonPrizesResponse>
```

## Parameters
- `props.raffle_id` — The parent raffle's `id` (from `TRaffle.id`). Required.
- `props.offset` — Zero-based index of the first row to return. Defaults to `0`.
- `props.limit` — Page size. Defaults to `20`.

## Returns — `Promise<GetRaffleWonPrizesResponse>`
`GetRaffleWonPrizesResponse`:
- `cid` (number)
- `ts` (number)
- `uuid` (string)
- `errCode` (number)
- `errMsg` (string)
- `user` (RaffleWonPrizeUser | null) — The user the won prizes belong to; `null` when `won_prizes` is empty.
  - `user_id` (number) — Internal user ID.
  - `avatar_id` (string) — Avatar image: a full URL for a system avatar, otherwise an avatar token to resolve against the widget's avatar domain.
  - `avatar_real_id` (number) — Numeric ID of the user's selected avatar definition.
  - `public_username` (string) — Public username; server-masked for other users (e.g. `"32:r*****"`).
  - `avatar_url` (string | null) — Always `null` on the wire — use `avatar_id`.
- `won_prizes` (RaffleWonPrize[]) — Page of won prizes for the requested raffle, newest-first.
  - `raf_won_id` (number) — Unique ID of the winning row (pass to `claimRafflePrize` when `requires_claim` is `true`).
  - `prize_id` (number) — ID of the prize definition.
  - `raffle_run_id` (number) — Run-instance ID of the draw that awarded this prize.
  - `draw_id` (number) — Schedule ID of the draw that awarded this prize.
  - `public_meta` (RaffleWonPrizePublicMeta) — Presentation meta (name / image).
    - `name` (string) — Name of the prize, e.g. '1 $'.
    - `hide_chance_to_win` (boolean) — Indicates whether the chance to win should be hidden in the UI.
    - `image_url` (string) — URL of the image that represents the prize.
  - `requires_claim` (boolean) — Whether this prize requires a claim action from the user.
  - `claimed_date` (number | null) — Epoch ms when the prize was claimed; `null` when not yet claimed.
- `total` (number) — Total number of won prizes for this user/raffle across all draws (for pagination).
- `offset` (number) — Zero-based offset of this page (echoes the resolved request).
- `limit` (number) — Page size (echoes the resolved request).

## Behavioral contract
**Authentication required**
Works only for an identified (logged-in) user. Visitor / anonymous
sessions are rejected — call this only after identify.

**Preconditions**
`raffle_id` is required — the SDK throws synchronously when it is
missing or falsy.

**Coverage & sort order**
Includes the user's wins from every draw of the raffle — recurring,
one-shot, and grand draws, across all historical runs. Rows are ordered
newest-win first; there is no "unclaimed first" ordering, so sort
client-side if you want claimable prizes at the top.

**Pagination**
`offset` / `limit` page the `won_prizes[]` rows (the SDK defaults to
`0` / `20`). `total` is the authoritative full count of the user's wins
for this raffle across all draws — drive "load more" from it
(`offset + won_prizes.length < total`). An `offset` past the end returns
an empty `won_prizes[]` with the real `total` and `errCode 0` — not an
error. The server does NOT clamp `limit`, so always pass an explicit,
sane page size.

**Rate limit**
The server caps this at roughly 30 calls per minute with a ~5-second
minimum gap between calls. Fetch on screen open and on explicit "load
more" — don't poll it on a timer.



**Reading the result**
- Null-check `user` before reading it — it is `null` whenever
 `won_prizes` is empty.
- For the avatar, use `user.avatar_id` (already a full URL for a system
 avatar, otherwise an avatar token to resolve against the widget's
 avatar domain); `user.avatar_url` is always `null`.
- Render `public_username` as-is (it is server-masked for privacy, e.g.
 `"32:r*****"`) and substitute a "You" label for the current user.
- Treat `claimed_date` as the claim flag: `null` until claimed, then
 epoch ms.

**Idempotency / Side effects**: safe and read-only — one-shot promise,
no client cache, no subscription. The server caches the response
briefly; a successful `claimRafflePrize` invalidates that cache,
so a follow-up call reflects the new `claimed_date`. This method does
NOT refresh the `getRaffles` list or fire its `onUpdate` — re-call
manually to pick up newly-won prizes or a `claimed_date` flip.

**UI guidance**: see [UI Guide — `getRaffleWonPrizes`](../../docs/ui/raffles/UIGuide_getRaffleWonPrizes.md).

**Visitor mode**: not supported (see "Authentication required").

## Example
```ts
const raffles = await window._smartico.api.getRaffles();
const raffle = raffles[0];

// First page of the user's won prizes for this raffle.
const page = await window._smartico.api.getRaffleWonPrizes({
  raffle_id: raffle.id,
  offset: 0,
  limit: 20,
});

if (page.errCode !== 0) {
  console.error('[smartico] could not load won prizes — show a retry state:', page.errMsg);
  return;
}
if (page.won_prizes.length === 0) {
  console.log('[smartico] no wins in this raffle (or not eligible) — render the empty state');
  return;
}

console.log('[smartico]', page.user?.public_username, 'won', page.total, 'prizes total');
for (const prize of page.won_prizes) {
  console.log('[smartico] render prize card —', prize.public_meta.name, prize.public_meta.image_url);
  if (prize.requires_claim && !prize.claimed_date) {
    console.log('[smartico] show a Claim CTA — on click call claimRafflePrize({ won_id:', prize.raf_won_id, '})');
  }
}

// Load more.
if (page.offset + page.won_prizes.length < page.total) {
  const next = await window._smartico.api.getRaffleWonPrizes({
    raffle_id: raffle.id,
    offset: page.offset + page.limit,
    limit: 20,
  });
  console.log('[smartico] appended', next.won_prizes.length, 'more prizes');
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success. Also returned with an empty `won_prizes[]` and
 `total 0` when the user has no wins, or is not eligible to see this
 raffle.
- `1` — generic server error; surface `errMsg` if present.

There are no granular codes — an unknown raffle, an ineligible user,
and "no wins" all surface as `errCode 0` with an empty list.

## Related
- `getRaffleDrawRunsHistory`
- `getRaffleDrawRun`
- `claimRafflePrize`
- `getRaffles`
- `GetRaffleWonPrizesResponse`
