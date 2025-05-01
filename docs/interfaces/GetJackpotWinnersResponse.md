# Interface: GetJackpotWinnersResponse

## Hierarchy

- `ProtocolResponse`

  ↳ **`GetJackpotWinnersResponse`**

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

### winners

• **winners**: [`JackpotWinnerHistory`](JackpotWinnerHistory.md)[]

The list of jackpot winners

___

### has\_more

• **has\_more**: `boolean`

Whether there are more winners to fetch
