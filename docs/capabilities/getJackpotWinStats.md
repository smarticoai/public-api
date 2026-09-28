# getJackpotWinStats — API (TGetJackpotWinStatsResponse)

> Returns past winners of a specific jackpot template, paginated, together with the win statistics of that template: total number of wins, the biggest win and the most recent win.
> Import: `import { TGetJackpotWinStatsResponse } from '@smartico/public-api'`
> Search terms: getJackpotWinStats, jackpots, TGetJackpotWinStatsResponse, JackpotWinnerHistory, JackPotWinner, JackpotWinStats, JackpotWin

## Signature
```ts
_smartico.api.getJackpotWinStats({
		limit,
		offset,
		jp_template_id,
	}: {
		/** Page size of the winners list (default 20). */
		limit?: number;
		/** Pagination offset of the winners list (default 0). */
		offset?: number;
		/** Jackpot template ID (required). */
		jp_template_id?: number;
	}): Promise<TGetJackpotWinStatsResponse>
```

## Parameters
_None._

## Returns — `Promise<TGetJackpotWinStatsResponse>`
`TGetJackpotWinStatsResponse`:
- `winners` (JackpotWinnerHistory[]) — The list of jackpot winners
  - `jp_pot_id` (number) — Id of the jackpot pot
  - `win_date_ts` (number) — Date of winning in milliseconds
  - `winner` (JackPotWinner) — Info about jackpot winner
    - `is_me` (boolean) — Flag indicating that this winner is the currently logged in user
    - `public_username` (string) — Name of the winner, note that for all users except is_me, the name is masked by default, but masking can be disabled by request to Smartico AM team
    - `winning_amount_jp_currency` (number) — Won amount in the Jackpot currency
    - `winning_amount_wallet_currency` (number) — Won amount in the user Wallet currency
    - `winning_position` (number) — Position of the winner. Relevant for jackpots where there could be multiple winners
    - `avatar_id` (string) — Avatar image URL of the winner
    - `avatar_real_id` (number | null) — Numeric ID of the winner's avatar; `null` when the winner has not picked one
- `win_stats` (JackpotWinStats) — Win statistics of the jackpot template
  - `total_wins` (number) — Total number of issued wins of the jackpot template. Wins waiting for manual approval are not counted
  - `highest_win` (JackpotWin | null) — The biggest win of the jackpot template, `null` when there are no wins yet
    - `winning_amount` (number) — Won amount in the Jackpot currency
    - `win_date_ts` (number) — Date of winning in milliseconds
    - `public_username` (string | null) — Name of the winner, masked by default. `null` when the jackpot template doesn't expose winners over API
  - `last_win` (JackpotWin | null) — The most recent win of the jackpot template, `null` when there are no wins yet
    - `winning_amount` (number) — Won amount in the Jackpot currency
    - `win_date_ts` (number) — Date of winning in milliseconds
    - `public_username` (string | null) — Name of the winner, masked by default. `null` when the jackpot template doesn't expose winners over API

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `jp_template_id` is mandatory.
- The consumer SHOULD check
  `JackpotDetails.expose_winners_over_api` before calling, since
  the server does not enforce it.

**Statistics**
- `win_stats` describes the whole jackpot template and does not depend
  on `limit` / `offset`. Pass `limit: 1` when only the statistics are needed.
- Only issued wins are counted — a pot that exploded but still waits for
  manual approval is not included.
- `highest_win` / `last_win` are `null` while the jackpot has no wins,
  `total_wins` is `0` in that case.
- `public_username` of `highest_win` / `last_win` is masked by the same
  label setting as the winners list, and is `null` when the template
  doesn't expose winners over API.
- The server refreshes the statistics once per minute.

**Currency caveat**
All amounts (`win_stats.*.winning_amount`,
`winners[].winner.winning_amount_jp_currency`) are in the jackpot's
NATIVE currency, NOT the user's wallet currency.

**Refresh**
- The SDK caches each page separately (per `jp_template_id` +
  `limit` + `offset`) for 30 seconds.
- Caches clear on jackpot-win push events and on opt-in / opt-out.

**Error handling**
Non-zero `errCode` on control-group users or generic server errors. The
SDK does NOT enumerate distinct codes — branch on `errCode === 0` and
surface `errMsg` on failure.

**Visitor mode**: not supported.

## Example
```ts
const [jp] = await window._smartico.api.jackpotGet({ jp_template_id: 42 });

if (!jp || !jp.expose_winners_over_api) {
    console.log('[smartico] winners hidden by operator config — hide the stats');
    return;
}

const { winners, win_stats } = await window._smartico.api.getJackpotWinStats({
    jp_template_id: 42,
    limit:          10,
    offset:         0,
});
console.log('[smartico] total wins', win_stats.total_wins);
console.log('[smartico] highest win', win_stats.highest_win?.winning_amount, jp.jp_currency);
console.log('[smartico] latest win', win_stats.last_win?.public_username, win_stats.last_win?.win_date_ts);
console.log('[smartico] render', winners.length, 'recent winner rows');
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `TGetJackpotWinStatsResponse`
