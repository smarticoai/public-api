# Interface: GetTournamentInfoResponse

## Hierarchy

- `ProtocolResponse`

  ↳ **`GetTournamentInfoResponse`**

## Properties

### cid

• **cid**: `number`

#### Inherited from

ProtocolResponse.cid

___

### ts

• `Optional` **ts**: `number`

#### Inherited from

ProtocolResponse.ts

___

### uuid

• `Optional` **uuid**: `string`

#### Inherited from

ProtocolResponse.uuid

___

### errCode

• `Optional` **errCode**: `number`

#### Inherited from

ProtocolResponse.errCode

___

### errMsg

• `Optional` **errMsg**: `string`

#### Inherited from

ProtocolResponse.errMsg

___

### tournamentInfo

• **tournamentInfo**: `Object`

tournament info

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `labelId` | `number` | id of label, not in use |
| `tournamentLobbyInfo` | [`Tournament`](Tournament.md) | - |
| `players` | [`TournamentPlayer`](TournamentPlayer.md)[] | list of registered users |

___

### userPosition

• **userPosition**: [`TournamentPlayer`](TournamentPlayer.md)

information about current user position

___

### prizeStructure

• `Optional` **prizeStructure**: `Object`

prizes structure

#### Type declaration

| Name | Type |
| :------ | :------ |
| `prizes` | [`TournamentPrize`](TournamentPrize.md)[] |
