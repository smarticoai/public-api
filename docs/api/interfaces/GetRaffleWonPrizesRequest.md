# Interface: GetRaffleWonPrizesRequest

## Extends

- `ProtocolMessage`

## Properties

### cid

> **cid**: `number`

#### Inherited from

`ProtocolMessage.cid`

***

### ts?

> `optional` **ts?**: `number`

#### Inherited from

`ProtocolMessage.ts`

***

### uuid?

> `optional` **uuid?**: `string`

#### Inherited from

`ProtocolMessage.uuid`

***

### raffle\_id

> **raffle\_id**: `number`

ID of the raffle to fetch the current user's won prizes for.

***

### offset

> **offset**: `number`

Zero-based index of the first won-prize row to return (pagination).

***

### limit

> **limit**: `number`

Maximum number of won-prize rows to return (pagination).
