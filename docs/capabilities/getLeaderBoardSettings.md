# getLeaderBoardSettings — API (LeaderBoardSettingsT)

> Returns the operator's privacy configuration for leaderboard rendering.
> Import: `import { LeaderBoardSettingsT } from '@smartico/public-api'`
> Search terms: getLeaderBoardSettings, leaderboard, LeaderBoardSettingsT

## Signature
```ts
_smartico.api.getLeaderBoardSettings(): LeaderBoardSettingsT
```

## Parameters
_None._

## Returns — `LeaderBoardSettingsT`
`LeaderBoardSettingsT`:
- `hide_avatars` (boolean) — When `true`, render leaderboard rows without player avatars.
- `hide_levels` (boolean) — When `true`, render leaderboard rows without player level names.
- `hide_other_points` (boolean) — When `true`, hide the points of every player except the current user. The current user's own points are always shown, regardless of this flag.

## Behavioral contract
**Flags** — each is `true` when the corresponding data must be hidden:
- `hide_avatars` — draw rows without the player avatar.
- `hide_levels` — draw rows without the player's level name.
- `hide_other_points` — hide `points` for every row except the current
  user's. The current user always sees their own points.

**Defaults on an unconfigured label** — `hide_avatars` and
`hide_levels` default to `false` (show), while `hide_other_points`
defaults to `true` (hide) unless the operator explicitly turned it off.
The asymmetry is intentional: it matches the default Smartico UI, so a
consumer rendering its own leaderboard next to the built-in one agrees
with it rather than exposing points the built-in surface hides.

**Synchronous** — the settings arrive with the session handshake, so
this returns immediately and never issues a round-trip. Call it on
every render rather than caching the result yourself.

**Idempotency / Side effects**: safe. Read-only.

**Visitor mode**: supported. Returns the same label-level configuration.

## Example
```ts
import { LeaderBoardPeriodType } from '@smartico/public-api';

const settings = window._smartico.api.getLeaderBoardSettings();
const board = await window._smartico.api.getLeaderBoard(LeaderBoardPeriodType.WEEKLY);

for (const row of board?.users ?? []) {
  const showPoints = row.is_me || !settings.hide_other_points;

  console.log('[smartico] render row', row.position, row.public_username,
    settings.hide_avatars ? '(no avatar)' : row.avatar_url,
    showPoints ? row.points : '(points hidden)');
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getLeaderBoard`
