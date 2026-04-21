# Interface: GetJackpotWinnersResponse

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

### winners

> **winners**: [`JackpotWinnerHistory`](JackpotWinnerHistory.md)[]

The list of jackpot winners

***

### has\_more

> **has\_more**: `boolean`

Whether there are more winners to fetch
