# Interface: GetRaffleDrawRunsHistoryRequest

## Hierarchy

- `ProtocolMessage`

  ↳ **`GetRaffleDrawRunsHistoryRequest`**

## Properties

### cid

• **cid**: `number`

#### Inherited from

ProtocolMessage.cid

___

### ts

• `Optional` **ts**: `number`

#### Inherited from

ProtocolMessage.ts

___

### uuid

• `Optional` **uuid**: `string`

#### Inherited from

ProtocolMessage.uuid

___

### raffle\_id

• **raffle\_id**: `number`

___

### draw\_id

• `Optional` **draw\_id**: `number`

If draw_id is not passed all draw runs that belong to raffle with passed raffle_id will be returned.
