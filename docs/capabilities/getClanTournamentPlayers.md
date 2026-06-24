# getClanTournamentPlayers — API (TClanTournamentPlayers)

> Returns the ranked players of a specific clan within a clan-based tournament instance.
> Import: `import { TClanTournamentPlayers } from '@smartico/public-api'`
> Search terms: getClanTournamentPlayers, tournaments, TClanTournamentPlayers

## Signature
```ts
_smartico.api.getClanTournamentPlayers(tournamentInstanceId: number, clanId: number): Promise<TClanTournamentPlayers>
```

## Parameters
- `tournamentInstanceId` — The tournament `instance_id` from a clan-based `TTournament`.
- `clanId` — The clan ID from `TTournamentDetailed.clan_leaderboard[].clan_id`.

## Returns — `Promise<TClanTournamentPlayers>`
`TClanTournamentPlayers`:
- `clan_id` (number) — Clan ID
- `clan_public_meta` ({ name: string; image_url: string }) — Clan display metadata
- `players` ({
		user_id: number;
		public_username: string;
		avatar_id: string;
		avatar_real_id: number;
		avatar_url?: string;
		position: number;
		scores: number;
		is_me: boolean;
		clean_ext_user_id: string;
	}[]) — Top players of this clan ranked by score DESC

## Behavioral contract
**Preconditions**
Pass a valid `tournamentInstanceId` (read from `TTournament.instance_id`
returned by `getTournamentsList`) and a `clanId` (read from
`TTournamentDetailed.clan_leaderboard[].clan_id` returned by
`getTournamentInstanceInfo`). The tournament should be
clan-based (`is_clan_based === true`); calling this against a
non-clan tournament typically returns an empty `players` array.

**Refresh model**
- **No subscription.** This is a one-shot promise.
- **No client cache.** Every call hits the server.
- **No push event** refreshes the response. Live updates to clan
 member rankings require a fresh call.
- The default Smartico UI fetches this once when the user opens the
 clan-drill-down modal and does NOT refresh while the modal is
 open. If your UI needs live updates, re-call on an interval; the
 clan leaderboard at the parent level (via
 `getTournamentInstanceInfo`) does refresh via its own
 polling cadence.

**Returned shape**
`TClanTournamentPlayers` carries the requested clan's identity
(`clan_id`, `clan_public_meta.name`, `clan_public_meta.image_url`)
alongside the `players[]` array — each entry has `position`,
`scores`, `public_username`, `clean_ext_user_id`, `avatar_id`,
`avatar_real_id`, the resolved `avatar_url`, `user_id`, and the
`is_me` flag identifying the current user's row. The `clan_id` and
`clan_public_meta` on the response echo the input clan — the
default Smartico UI ignores them and renders the header from the
caller-side `ClanLeaderboardEntry` object, but they're available
for consumers that don't already have that context.

**Username display**: prefer `clean_ext_user_id` when set, falling
back to `public_username`. The default Smartico UI uses
`clean_ext_user_id || public_username || ''`.

**Idempotency**: safe. Read-only. Each call returns the latest
server snapshot.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getClanTournamentPlayers`](../../docs/ui/tournaments/UIGuide_getClanTournamentPlayers.md).

**Visitor mode**: not supported.

## Example
```ts
const detail = await window._smartico.api.getTournamentInstanceInfo(tournamentInstanceId);
if (!detail.is_clan_based || !detail.clan_leaderboard) {
  console.log('[smartico] not a clan tournament — skip clan drill-down');
  return;
}

// User clicked a clan row in the leaderboard.
const clickedClan = detail.clan_leaderboard[0];

console.log('[smartico] opening clan drill-down — show modal skeleton while loading');
const result = await window._smartico.api.getClanTournamentPlayers(
  tournamentInstanceId,
  clickedClan.clan_id,
);

if (result.players.length === 0) {
  console.log('[smartico] clan has no ranked players yet — render empty state ("No leaders yet")');
} else {
  console.log('[smartico] render clan member rows with .is-me highlight on the current user;',
    result.players.length, 'players ranked');
  const me = result.players.find(p => p.is_me);
  if (me) {
    console.log('[smartico] current user rank in this clan:', me.position, 'score:', me.scores);
  }
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getTournamentsList`
- `getTournamentInstanceInfo`
