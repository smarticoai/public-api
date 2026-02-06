# Interface: GetTournamentInfoResponse

Response for getTournamentInstanceInfo (raw, non-transformed).

## Properties

### tournamentInfo

• **tournamentInfo**: `object`

Tournament information object

| Property | Type | Description |
|----------|------|-------------|
| `labelId` | `number` | ID of label (not in use) |
| `tournamentLobbyInfo` | [`Tournament`](Tournament.md) | Tournament details |
| `players` | [`TournamentPlayer[]`](TournamentPlayer.md) | List of registered users |

___

### userPosition

• **userPosition**: [`TournamentPlayer`](TournamentPlayer.md)

Information about current user's position in the tournament

___

### prizeStructure

• **prizeStructure**: `object`

Prize structure (optional)

| Property | Type | Description |
|----------|------|-------------|
| `prizes` | [`TournamentPrize[]`](TournamentPrize.md) | Array of prizes |
