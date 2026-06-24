# getRelatedItemsForGame — API (GetRelatedAchTourResponse)

> Returns the missions and tournaments associated with a casino / sportsbook game in the operator's games catalog — the reverse of "given this mission, which games count for it" — so you can surface "play this game to progress mission X" / "tournament Y features this game" badges on game tiles or detail screens.
> Import: `import { GetRelatedAchTourResponse } from '@smartico/public-api'`
> Search terms: getRelatedItemsForGame, general, GetRelatedAchTourResponse, UserAchievement, AchievementType, AchievementPublicMeta, UserAchievementTask, AchievementStatus, ScheduledMissionType, AchRelatedGame, BadgesTimeLimitStates, Tournament, TournamentType, TournamentPublicMeta, TournamentRegistrationType

## Signature
```ts
_smartico.api.getRelatedItemsForGame(related_game_id: string): Promise<GetRelatedAchTourResponse>
```

## Parameters
- `related_game_id` — External Games Catalog ID of the game (e.g. `"gold-slot2"`).

## Returns — `Promise<GetRelatedAchTourResponse>`
`GetRelatedAchTourResponse` (shape from the type — capture a response into `_responses/` for a real example):
- `cid` (number)
- `ts` (number)
- `uuid` (string)
- `errCode` (number)
- `errMsg` (string)
- `achievements` (UserAchievement[])
- `tournaments` (Tournament[])

## Behavioral contract
**Preconditions**
- `related_game_id` must be a Games Catalog ID (the same external string the
 operator uses in the catalog at
 `https` ://help.smartico.ai/welcome/technical-guides/games-catalog-api).

**Server-side eligibility filtering**
Missions and tournaments are filtered by the user's segments / level / brand
before being returned. A user who is ineligible for a mission segment will
NOT see that mission in the result even if it lists the game. The same
filtering applies to tournaments. Treat the response as "what this user
should see" — no client-side eligibility pass needed.

**No cache**
Every call is a live server round-trip. Missions/tournaments are operator-
mutated state (opt-in, completion, expiry) that changes during a session;
caching staler than the user's last action would mis-render eligibility.
Avoid building a consumer-side cache for UI-critical paths.

**Refresh**
- Re-call when the user navigates to a new game tile / detail surface.
- Re-call after the user opts into / completes a related mission to refresh
 the "play this game" badge.

**Visitor mode**: supported via `_smartico.vapi(lang).getRelatedItemsForGame(...)`.

**UI guidance**: see [UI Guide — `getRelatedItemsForGame`](../../docs/ui/general/UIGuide_getRelatedItemsForGame.md).

## Example
```ts
const r = await window._smartico.api.getRelatedItemsForGame('gold-slot2');

const missions = r.achievements ?? [];
const tournaments = r.tournaments ?? [];

if (missions.length === 0 && tournaments.length === 0) {
    console.log('[smartico] no related missions / tournaments — hide the related badge on the game tile');
} else {
    console.log('[smartico] related entities:', missions.length, 'missions /', tournaments.length, 'tournaments — show a "X missions / Y tournaments" badge');
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `https`
- `GetRelatedAchTourResponse`
