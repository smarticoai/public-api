# Interface: GetRaffleDrawRunsHistoryRequest

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

***

### draw\_id?

> `optional` **draw\_id?**: `number`

If draw_id is not passed all draw runs that belong to raffle with passed raffle_id will be returned.
