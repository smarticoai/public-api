# Interface: StoreItem

Store item object (raw, non-transformed).

## Properties

### id

• **id**: `number`

Item ID

___

### itemTypeId

• **itemTypeId**: `number`

Item type ID

___

### itemPublicMeta

• **itemPublicMeta**: `StoreItemPublicMeta`

Public metadata for UI display (name, description, price, image, etc.)

___

### categoryIds

• **categoryIds**: `number[]`

Array of category IDs this item belongs to

___

### canBuy

• **canBuy**: `boolean`

Whether the user can currently buy this item

___

### shopPool

• **shopPool**: `number`

Available stock in the shop pool

___

### activeTillDate

• **activeTillDate**: `number`

Timestamp when the item expires (optional)
