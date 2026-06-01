# Interface: GetRaffleWonPrizesResponse

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

### user

> **user**: [`RaffleWonPrizeUser`](RaffleWonPrizeUser.md)

The user the won prizes belong to; `null` when `won_prizes` is empty.

***

### won\_prizes

> **won\_prizes**: [`RaffleWonPrize`](RaffleWonPrize.md)[]

Page of won prizes for the requested raffle, newest-first.

***

### total

> **total**: `number`

Total number of won prizes for this user/raffle across all draws (for pagination).

***

### offset

> **offset**: `number`

Zero-based offset of this page (echoes the resolved request).

***

### limit

> **limit**: `number`

Page size (echoes the resolved request).
