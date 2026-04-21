# Interface: GetTournamentInfoResponse

## Extends

- `ProtocolResponse`

## Properties

### cid

> **cid**: `number`

#### Inherited from

`ProtocolResponse.cid`

***

### ts?

> `optional` **ts?**: `number`

#### Inherited from

`ProtocolResponse.ts`

***

### uuid?

> `optional` **uuid?**: `string`

#### Inherited from

`ProtocolResponse.uuid`

***

### errCode?

> `optional` **errCode?**: `number`

#### Inherited from

`ProtocolResponse.errCode`

***

### errMsg?

> `optional` **errMsg?**: `string`

#### Inherited from

`ProtocolResponse.errMsg`

***

### tournamentInfo

> **tournamentInfo**: `object`

tournament info

#### labelId

> **labelId**: `number`

id of label, not in use

#### tournamentLobbyInfo

> **tournamentLobbyInfo**: [`Tournament`](Tournament.md)

#### players

> **players**: [`TournamentPlayer`](TournamentPlayer.md)[]

list of registered users

***

### userPosition

> **userPosition**: [`TournamentPlayer`](TournamentPlayer.md)

information about current user position

***

### prizeStructure?

> `optional` **prizeStructure?**: `object`

prizes structure

#### prizes

> **prizes**: [`TournamentPrize`](TournamentPrize.md)[]

***

### clanLeaderboard?

> `optional` **clanLeaderboard?**: [`ClanLeaderboardEntry`](ClanLeaderboardEntry.md)[]

Ranked list of clans in this tournament. Empty/null for non-clan tournaments.

***

### userClanId?

> `optional` **userClanId?**: `number`

The clan ID the current user belongs to.
null when the user has no clan or the tournament is not clan-based.
Match against clanLeaderboard[i].clan_id to highlight the user's clan row.

***

### clanPrizes?

> `optional` **clanPrizes?**: [`ClanPrizeStructureEntry`](ClanPrizeStructureEntry.md)[]

Per-clan prize structure. Empty/null for non-clan tournaments.
