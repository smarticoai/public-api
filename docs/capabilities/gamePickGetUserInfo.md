# gamePickGetUserInfo — API (GamePickUserInfo)

> Returns the current user's profile within the Game Pick system — display name, avatar, balances, and last wallet-sync timestamp.
> Import: `import { GamePickUserInfo } from '@smartico/public-api'`
> Search terms: gamePickGetUserInfo, gamepick, GamePickUserInfo, errCode, data

## Signature
```ts
_smartico.api.gamePickGetUserInfo(props: GamePickRequestParams): Promise<GamesApiResponse<GamePickUserInfo>>
```

## Parameters
- `props.saw_template_id` — ID of the MatchX or Quiz game template.

## Returns — `Promise<GamesApiResponse<GamePickUserInfo>>`
Wrapped in `GamesApiResponse`: `errCode` (number — `0` = success), `errMessage?` (string), `data?` — the payload:

`GamePickUserInfo`:
- `ext_user_id` (string) — External user ID (Smartico numeric user ID)
- `int_user_id` (number) — Internal user ID within the games system
- `public_username` (string) — Display name
- `avatar_url` (string) — URL of the user's avatar image
- `gp_position` (number) — User's leaderboard rank position
- `full_wins_count` (number) — Number of fully correct predictions
- `part_wins_count` (number) — Number of partially correct predictions
- `resolution_score` (number) — User's total score
- `last_wallet_sync_time` (string) — ISO 8601 date-time string of the last time the user's balance was synced from the Smartico platform.
- `ach_points_balance` (number) — User's current points balance
- `ach_gems_balance` (number) — User's current gems balance
- `ach_diamonds_balance` (number) — User's current diamonds balance
- `pubic_username_set` (boolean) — Whether the user has set a custom public username

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.

**Balance freshness**
The balances returned here are the cached mirror — at most ~1 minute stale.
For an up-to-the-second view of Points / Gems / Diamonds, read from
`getUserProfile` instead. Use this method's balances only for
in-Game-Pick display.



**Refresh**
- No cache. Server-side mirror refreshes at most every 60 s.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `gamePickGetUserInfo`](../../docs/ui/gamepick/UIGuide_gamePickGetUserInfo.md).

## Example
```ts
const r = await window._smartico.api.gamePickGetUserInfo({ saw_template_id: 1083 });

if (r.errCode === 0 && r.data) {
    console.log('[smartico] render Game Pick header — name:', r.data.public_username, '— points:', r.data.ach_points_balance, '— synced:', r.data.last_wallet_sync_time);
}
```

### Example response (REAL shape)
```json
{
  "errCode": 0,
  "data": {
    "ext_user_id": "361368543",
    "int_user_id": "216289785",
    "public_username": "Antonio",
    "avatar_url": "https://cdn.example/avatars/12/00000000-0000-0000-0000-000000000000.png",
    "last_wallet_sync_time": "2026-06-24T11:56:54.592Z",
    "ach_points_balance": 326,
    "ach_gems_balance": 10,
    "ach_diamonds_balance": 1,
    "pubic_username_set": true
  }
}
```

## Errors
**Error codes** (in `errCode`)
- `0` — success.
- `100002` — template not found.
- `100000` — auth hash invalid.
- `100004` — generic server error.

## Related
- `getUserProfile`
- `GamesApiResponse`
- `GamePickUserInfo`
