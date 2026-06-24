# getJackpotEligibleGames — API (TGetJackpotEligibleGamesResponse)

> Returns the casino games eligible to contribute to a specific jackpot — the catalog the user must play to grow the pot.
> Import: `import { TGetJackpotEligibleGamesResponse } from '@smartico/public-api'`
> Search terms: getJackpotEligibleGames, jackpots, TGetJackpotEligibleGamesResponse, JackpotEligibleGame, onUpdate, subscription, eligible_games

## Signature
```ts
_smartico.api.getJackpotEligibleGames({ jp_template_id, onUpdate } : {
		/** Jackpot template ID (required). */
		jp_template_id: number,
		/** Optional callback; not auto-invoked today. */
		onUpdate?: () => void,
	}): Promise<TGetJackpotEligibleGamesResponse>
```

## Parameters
_None._

## Returns — `Promise<TGetJackpotEligibleGamesResponse>`
`TGetJackpotEligibleGamesResponse`:
- `eligible_games` (JackpotEligibleGame[])
  - `game_id` (number) — ID of the game on Smartico side
  - `ext_game_id` (string) — ID of the game on operator side
  - `name` (string) — Name of the game
  - `link` (string) — Link to the game
  - `image` (string) — Image of the game
  - `enabled` (boolean) — Whether the game is enabled
  - `game_categories` (string[]) — Categories of the game
  - `game_provider` (string) — Provider of the game
  - `mobile_spec_link` (string) — The link to the mobile game
  - `priority` (number) — The priority of the game

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `jp_template_id` is mandatory.

**`onUpdate` caveat**
The `onUpdate` callback is accepted to match the SDK's subscription
contract but is NOT auto-invoked by any current server push. It will only
fire if a consumer (or a future SDK version) explicitly pushes an update.
Treat it as a no-op for now.

**Refresh**
- The SDK caches per `jp_template_id` for 30 seconds.
- Cache does NOT clear on opt-in / opt-out / jackpot-win — eligible-game
  lists rarely change during a session. Wait for the 30 s TTL.

**Error handling**
Non-zero `errCode` on control-group users or generic server errors.
Branch on `errCode === 0` and surface `errMsg` on failure.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getJackpotEligibleGames`](../../docs/ui/jackpots/UIGuide_getJackpotEligibleGames.md).

## Example
```ts
const [jp] = await window._smartico.api.jackpotGet({ jp_template_id: 42 });

if (jp?.ach_related_game_allow_all) {
    console.log('[smartico] all games eligible — hide the eligible-games tab');
    return;
}

const r = await window._smartico.api.getJackpotEligibleGames({ jp_template_id: 42 });
console.log('[smartico] render', r.eligible_games.length, 'eligible game tiles');
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "eligible_games": [
    {
      "game_id": 2106041136,
      "ext_game_id": "666",
      "name": "Deadman's Luck",
      "image": "https://cdn.example/d67393a1c13d95219e6d03-SlotLogowithSkulls.png",
      "enabled": true,
      "priority": 1
    }
  ]
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `JackpotDetails.ach_related_game_allow_all`
- `TGetJackpotEligibleGamesResponse`
