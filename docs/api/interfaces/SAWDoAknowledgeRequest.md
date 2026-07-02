# Interface: SAWDoAknowledgeRequest

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

### request\_id

> **request\_id**: `string`

***

### lose?

> `optional` **lose?**: `boolean`

When true, finalises the spin as lost: the prize is not credited and is returned to the prize pool.
