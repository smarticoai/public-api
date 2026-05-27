# UI Guide — `getRelatedItemsForGame`

## Overview
- Returns the missions and tournaments that reference a casino / sportsbook
  game in the operator's catalog.
- Use to surface "X missions / Y tournaments feature this game" badges on
  game tiles, lobby cards, or dedicated game detail screens.
- Server applies user-eligibility filtering — results are already scoped to
  what this user should see.
- No cache; every call is a live round-trip.

## Trigger points

When to call:

| Surface | Trigger |
|---|---|
| Game tile in lobby | Hover (desktop) / focus (mobile) — debounce 300 ms |
| Game detail page | Mount |
| Tournament detail "Related Games" panel | Mount (the reverse direction — `tournament.related_games[]` lists games, this method goes game → tournament) |
| Mission detail panel | Mount alongside the mission's own data |

Do NOT call on every game tile render — the response is not cached and
network roundtrips per tile will overwhelm the connection. Use lazy / hover-
triggered loading.

## Result rendering

The response has two arrays:

```ts
{
  achievements: UserAchievement[];  // missions (same shape as getMissions)
  tournaments?: Tournament[];        // tournaments (same shape as getTournamentsList)
}
```

Both may be empty / undefined. The shape mirrors `getMissions` and
`getTournamentsList` — no reduced subset, no different field semantics.

### Quick badge (game tile overlay)

For a small overlay on a game tile:

```ts
const r = await window._smartico.api.getRelatedItemsForGame(gameId);
const total = (r.achievements?.length ?? 0) + (r.tournaments?.length ?? 0);

if (total > 0) {
  console.log('[smartico] show a "+' + total + '" badge on the game tile');
}
```

The default Smartico UI uses a small accent badge with the total count and an
icon hinting at gamification (typically a star or trophy).

### Full panel (game detail / mission / tournament context)

For a detail panel:

| Section | Source | Layout |
|---|---|---|
| "Missions featuring this game" | `r.achievements` | Vertical list, mission card per item |
| "Tournaments featuring this game" | `r.tournaments` | Horizontal scroll or vertical list, tournament card per item |

Use the same card layouts as `getMissions` (see
[`getMissions`](../../api/classes/WSAPIMissions.md#getmissions) UI guide) and
`getTournamentsList` (see
[`getTournamentsList`](../../api/classes/WSAPITournaments.md#gettournamentslist)
UI guide). Field semantics are identical.

## Empty results

Empty results are the default for most games — operators typically link
missions / tournaments to specific featured games, not the entire catalog.

UI options:

- **Game tile overlay**: hide the badge entirely (don't render an empty
  "0 missions" placeholder).
- **Detail panel**: omit the panel when both arrays are empty. The default
  Smartico UI shows a small "No related missions or tournaments" message
  only when the user explicitly opens a dedicated "Related" tab and it's
  empty.

## Refresh

- **No cache** — every call hits the server.
- Re-call after:
  - The user opts into or completes a related mission (to refresh the
    progress/status displayed on the badge).
  - The user navigates between games.
- Do NOT build a consumer-side cache for UI-critical paths — missions and
  tournaments are live-operated state and stale data would mis-render
  eligibility.

## Loading state

The call typically returns in 100–300 ms. UI patterns:

- **Game tile overlay**: render the tile immediately; show the badge once
  the call resolves. No spinner.
- **Detail panel**: show a skeleton row layout (1–3 placeholder rows) while
  loading.

## Error handling

The method returns the raw protocol response. Inspect transport-level
exceptions via try/catch:

```ts
try {
  const r = await window._smartico.api.getRelatedItemsForGame('gold-slot2');
  // ...
} catch (e) {
  console.error('[smartico] related items fetch failed — hide the related badge:', e);
}
```

## Visitor mode

Documented as supported via `_smartico.vapi(lang).getRelatedItemsForGame(...)`,
but in practice the server may require an authenticated user for the
eligibility filtering to work. Visitor calls have been seen to fail in some
deployments — test the specific deployment before relying on it.

## Mobile vs desktop

- **Mobile**: overlay badges on tiles; tap-through to a sheet with the
  related items.
- **Desktop**: hover-overlay or always-visible badges; click to open the
  related panel in a sidebar or modal.

## Performance

- One round-trip per game ID. No cache.
- Debounce hover-triggered calls (300 ms) to avoid spurious requests when
  the user moves the cursor across tiles.
- Pre-fetch on game tile mount only if the lobby is small (< 20 tiles);
  otherwise lazy-load on user interest.
