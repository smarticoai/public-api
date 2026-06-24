# getTournamentsList — API (TTournament)

> Returns the list of tournaments currently visible to the user, scoped server-side to what the user's segments qualify them to see.
> Import: `import { TTournament } from '@smartico/public-api'`
> Search terms: getTournamentsList, tournaments, getTournaments, TTournament, TRibbon, TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS, TournamentRegistrationTypeName, TournamentRegistrationStatusName, onUpdate, subscription, instance_id, tournament_id, name, description, image1, image2, image2_mobile, prize_pool_short

## Signature
```ts
_smartico.api.getTournamentsList({ onUpdate }: { onUpdate?: (data: TTournament[]) => void } = {}): Promise<TTournament[]>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed tournament list after every `registerInTournament` round-trip on this connection. Each call overwrites the prior callback. Never fires in visitor mode.

## Returns — `Promise<TTournament[]>`
Array of `TTournament`. Each item:
- `instance_id` (number) — ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run
- `tournament_id` (number) — ID of tournament template
- `name` (string) — Name of the tournament, translated to the user language
- `description` (string) — Description of the tournament, translated to the user language
- `image1` (string) — 1st image URL representing the tournament, 544×216px
- `image2` (string) — 2nd image URL representing the tournament, 920x200px
- `image2_mobile` (string) — 2nd image URL representing the tournament for mobile, 720x400px
- `prize_pool_short` (string) — The message indicating the prize pool of the tournament
- `custom_data` (object) — The custom data of the tournament defined by operator. Can be a JSON object, string or number
- `is_featured` (boolean) — The indicator if the tournament is 'Featured'
- `start_time` (number) — The time when tournament is going to start, epoch with milliseconds
- `end_time` (number) — The time when tournament is going to finish, epoch with milliseconds
- `registration_count` (number) — Number of users registered in the tournament
- `is_user_registered` (boolean) — flag indicating if current user is registered in the tournament
- `players_min_count` (number) — Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start
- `players_max_count` (number) — Maximum number of participant for this tournament. When reached, new users won't be able to register
- `registration_status` (string) — Status of registration in the tournament for current user
- `registration_type` (string) — Type of registration in the tournament
- `registration_cost_gems` (number) — Cost of registration in the tournament in gems
- `duration_ms` (number) — Tournament duration in millisecnnds
- `is_active` (boolean) — Indicator if tournament instance is active, means in one of the statues - PUBLISHED, REGISTED, STARTED
- `is_can_register` (boolean) — Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet
- `is_cancelled` (boolean) — Indicator if tournament instance is cancelled (status CANCELLED)
- `is_finished` (boolean) — Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)
- `is_in_progress` (boolean) — Indicator if tournament instance is running (status STARTED)
- `is_upcoming` (boolean) — Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)
- `min_scores_win` (number) — The minimum amount of score points that the user should get in order to be qualified for the prize
- `hide_leaderboard_min_scores` (boolean) — When enabled, users who don’t meet the minimum qualifying score will be hidden from the Leaderboard
- `total_scores` (null) — Total scores across all participants in the tournament
- `is_clan_based` (boolean) — True when this tournament groups participants by clan

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed list (never a diff/patch).
Each subsequent call to `getTournamentsList({ onUpdate })` REPLACES
the prior callback — only one active subscriber at a time. Pass
`onUpdate: undefined` (or omit it) to keep the prior callback in
place; the callback is never auto-cleared.

**Update triggers** — the callback fires when:

1. `registerInTournament(...)` resolves on this connection (any
 `err_code`). The refreshed list reflects the new
 `is_user_registered` / `registration_status` /
 `registration_count` on the affected tournament.

Does NOT fire for: tournament lifecycle transitions (start, finish,
cancellation), score updates, other users' registrations, or
operator-side BO edits. Those changes surface only on the next
cache miss (after the 30 s TTL) — poll manually if your UI needs
sub-30s lifecycle freshness.

**Server-side filtering** (what's excluded before the SDK sees it)
The server filters by visibility segment and entry segment, removes
tournaments past their post-finish display window, and excludes
tournaments not yet published. SDK consumers receive only items
the user is eligible to see; no client-side gating is required.

**Reading state from the returned item**
Drive list bucketing and CTA labels from the SDK-computed booleans
(`is_active`, `is_can_register`, `is_cancelled`, `is_finished`,
`is_in_progress`, `is_upcoming`), NOT from raw `start_time` /
`end_time` comparisons — the booleans encode the canonical
lifecycle states and already reflect server-side rules around
qualifying scores and late registration. `is_user_registered` is
independent of `is_can_register` — a registered user has
`is_user_registered: true` and `is_can_register: false`. The `me`
block (if present) carries the user's own leaderboard position and
score; it's undefined for unregistered users, users without any
recorded score, and visitor-mode sessions. The `prize_pool_short`
field carries the operator-supplied summary string ("$10,000",
"Mixed prizes") for compact card rendering; the full per-place
`prizes[]` breakdown is also populated here but is typically
rendered only in the detail view via
`getTournamentInstanceInfo`.

**Cross-references**
Tournaments with `is_clan_based: true` group participants by clan —
see `getClanTournamentPlayers` for fetching the players list
of a specific clan within a clan tournament. The detailed lobby
view (with full player leaderboard and prize structure) comes from
`getTournamentInstanceInfo`. Tournaments with
`custom_section_id` belong to an operator-defined custom section
(resolve metadata via `getCustomSections()`).

**Cache TTL**: the SDK caches the response for 30 seconds. Cache is
fully cleared on login / logout.

**Idempotency**: safe. Read-only. Repeated calls within the cache
window return a deep-cloned cached array without a network
round-trip.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getTournamentsList`](../../docs/ui/tournaments/UIGuide_getTournamentsList.md).

**Visitor mode**: supported. The same shape is returned, scoped to
the brand's public tournament list. Per-user fields (`me`,
`is_user_registered`, `registration_status`) are not meaningful.
The `onUpdate` callback is accepted but never fires (registration
mutations are not supported in visitor mode).

## Example
```ts
const tournaments = await window._smartico.api.getTournamentsList({
  onUpdate: (refreshed) => {
    console.log('[smartico] tournament list refreshed — re-render the lobby UI from this array, do not merge with prior state:', refreshed);
    const justRegistered = refreshed.filter(t => t.is_user_registered);
    console.log('[smartico] user is now registered in these tournaments:', justRegistered.map(t => t.name));
  },
});

// Bucket items by lifecycle state for a tabbed UI.
const live = tournaments.filter(t => t.is_in_progress);
const upcoming = tournaments
  .filter(t => t.is_upcoming && !t.is_user_registered)
  .sort((a, b) => a.start_time - b.start_time);
const mine = tournaments.filter(t => t.is_user_registered);
const finished = tournaments.filter(t => t.is_finished);

console.log('[smartico] render lobby tabs with these counts: live=', live.length,
  'upcoming=', upcoming.length, 'mine=', mine.length, 'finished=', finished.length);

// Featured tournament: pin to position 0 of the Overview/Top tabs.
const featured = tournaments.find(t => t.is_featured && !t.is_cancelled);
if (featured) {
  console.log('[smartico] featured tournament — pin to position 0 of the Overview tab:', featured.name);
}

// Visitor mode: onUpdate accepted but never fires; re-poll if needed.
// const visitorList = await window._smartico.vapi('EN').getTournamentsList();
```

### Example response (REAL shape)
```json
[
  {
    "instance_id": 585461,
    "tournament_id": 4450,
    "name": "Old Dragon's Hoard",
    "description": "   <style>\n        /* Add your CSS here */\n        .custom-rules {\n            font-family: inherit;\n            background-color: #2c295c !important;\n      …",
    "image1": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773753066010-1.png",
    "image2": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773755039087-0.png",
    "image2_mobile": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773755761006-0.png",
    "prize_pool_short": "The Dragon's treasure",
    "custom_data": {},
    "is_featured": false,
    "start_time": 1782216000000,
    "end_time": 1782302400000,
    "registration_count": 0,
    "is_user_registered": false,
    "players_min_count": 0,
    "players_max_count": 200,
    "registration_status": "UNKNOWN",
    "registration_type": "BUY_IN_GEMS",
    "registration_cost_gems": 3,
    "duration_ms": 86400000,
    "is_active": true,
    "is_can_register": false,
    "is_cancelled": false,
    "is_finished": false,
    "is_in_progress": true,
    "is_upcoming": false,
    "min_scores_win": 1,
    "hide_leaderboard_min_scores": false,
    "total_scores": null,
    "is_clan_based": false
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getTournamentInstanceInfo`
- `getClanTournamentPlayers`
- `registerInTournament`
