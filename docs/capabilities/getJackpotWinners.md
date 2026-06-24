# getJackpotWinners — API (JackpotWinnerHistory)

> Returns past winners of a specific jackpot template, paginated.
> Import: `import { JackpotWinnerHistory } from '@smartico/public-api'`
> Search terms: getJackpotWinners, jackpots, JackpotWinnerHistory, winner, win_date_ts, jp_pot_id

## Signature
```ts
_smartico.api.getJackpotWinners({
		limit,
		offset,
		jp_template_id,
	}: {
		/** Page size (default 20). */
		limit?: number;
		/** Pagination offset (default 0). */
		offset?: number;
		/** Jackpot template ID (required). */
		jp_template_id?: number;
	}): Promise<JackpotWinnerHistory[]>
```

## Parameters
_None._

## Returns — `Promise<JackpotWinnerHistory[]>`
Array of `JackpotWinnerHistory`. Each item:
- `winner` (object) — Info about jackpot winner
- `win_date_ts` (number) — Date of winning in milliseconds
- `jp_pot_id` (number) — Id of the jackpot pot

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `jp_template_id` is mandatory — the SDK throws synchronously if missing.
- The consumer SHOULD check
 `JackpotDetails.expose_winners_over_api` before calling, since
 the server does not enforce it.

**Pagination**
Server default page size is 20. Pass `limit` and `offset` to paginate
(e.g. infinite-scroll). The wire response carries a `has_more` flag, but
this SDK method returns only the `winners` array — detect end-of-list by
a returned array shorter than `limit`.

**Currency caveat**
Winner amounts in the response (`winner.winning_amount_jp_currency`) are
in the jackpot's NATIVE currency, NOT the user's wallet currency. If a
user-currency display is needed, the consumer must convert client-side.

**Refresh**
- The SDK caches per `jp_template_id` for 30 seconds.
- Caches clear on jackpot-win push events and on opt-in / opt-out.

**Error handling**
Non-zero `errCode` on control-group users or generic server errors. The
SDK does NOT enumerate distinct codes — branch on `errCode === 0` and
surface `errMsg` on failure.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getJackpotWinners`](../../docs/ui/jackpots/UIGuide_getJackpotWinners.md).

## Example
```ts
const [jp] = await window._smartico.api.jackpotGet({ jp_template_id: 42 });

if (!jp || !jp.expose_winners_over_api) {
    console.log('[smartico] winners hidden by operator config — hide the winners tab');
    return;
}

const winners = await window._smartico.api.getJackpotWinners({
    jp_template_id: 42,
    limit:          20,
    offset:         0,
});
console.log('[smartico] render', winners.length, 'recent winner rows (amounts in', jp.jp_currency + ')');
```

### Example response (REAL shape)
```json
[
  {
    "winner": {
      "is_me": false,
      "public_username": "731:*****",
      "winning_amount_jp_currency": 14.30613568,
      "winning_amount_wallet_currency": 84.29993939,
      "winning_position": 1,
      "avatar_id": "183751682",
      "avatar_real_id": null
    },
    "win_date_ts": 1782274146343,
    "jp_pot_id": 306000
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `JackpotDetails`
- `JackpotDetails.expose_winners_over_api`
- `JackpotWinnerHistory`
