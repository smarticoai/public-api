# UI Guide — `getJackpotEligibleGames`

## Overview
- Returns the casino games that contribute to a specific jackpot.
- Powers the "Eligible Games" tab inside the jackpot detail modal.
- 30 s cache; no push subscription.
- **Skip this call entirely** when
  [`JackpotDetails`](../../api/interfaces/JackpotDetails.md)`.ach_related_game_allow_all === true`
  — every game contributes, no list needed.

## Pre-flight check

```ts
const [jp] = await window._smartico.api.jackpotGet({ jp_template_id });

if (jp?.ach_related_game_allow_all) {
  console.log('[smartico] every game contributes — hide the eligible games tab entirely');
  return;
}

const r = await window._smartico.api.getJackpotEligibleGames({ jp_template_id });
```

## List view organization

The response shape is `{ eligible_games: JackpotEligibleGame[] }`. The
default Smartico UI renders games as a grid of tiles, sorted by their
server-provided `priority` (ascending).

## Item tile

| Field | Source | Notes |
|---|---|---|
| Thumbnail | `image` | Square aspect ratio; ~120×120 px tile |
| Name | `name` | Below the thumbnail |
| Provider | `game_provider` | Small chip / secondary text |
| Status | `enabled` | Dim / hide tiles with `enabled === false` |

**Click target**: tap → open the game (operator-defined launch via
`link` / `mobile_spec_link`).

## `onUpdate` caveat

The method accepts an `onUpdate` callback to match the SDK's
subscription contract — but no server push is currently wired to fire
it automatically. Treat the callback as a no-op for now and refresh
manually if needed.

## Empty / loading / error states

- **Empty**: "No eligible games" — uncommon; usually means operator
  misconfiguration.
- **Loading (cold fetch)**: skeleton tile grid.
- **Error**: keep prior list if any; non-blocking banner.

## Refresh

- 30 s SDK cache per `jp_template_id`.
- Cache does NOT clear on opt-in / opt-out / win events — eligible-game
  lists rarely change during a session.
- For long sessions, re-call when reopening the tab past the 30 s
  window.

## Visitor mode

Supported via `_smartico.vapi(lang).getJackpotEligibleGames(...)`. The
eligible-games list is template-level (which games contribute to the
pot) and carries no per-user fields, so a visitor session sees the same
list an identified user would. The `lang` passed to `_smartico.vapi(lang)`
drives the translation of game names.

## Mobile vs desktop

- **Mobile**: 2- or 3-column tile grid.
- **Desktop**: 4- or 5-column tile grid.

## Performance

- Lazy-load — call only when the user opens the Eligible Games tab.
- 30 s cache absorbs rapid tab switches.
- Skip entirely on `ach_related_game_allow_all === true` jackpots.
