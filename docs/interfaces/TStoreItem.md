# Interface: TStoreItem

TStoreItem describes the information of the store item defined in the system

## Properties

### id

• **id**: `number`

ID of the store item

___

### name

• **name**: `string`

Name of the store item, translated to the user language

___

### description

• **description**: `string`

Description of the store item, translated to the user language

___

### image

• **image**: `string`

URL of the image of the store item

___

### type

• **type**: ``"tangible"`` \| ``"bonus"`` \| ``"minigamespin"`` \| ``"changelevel"`` \| ``"prizedrop"`` \| ``"unknown"``

Type of the store item. Can be 'bonus' or 'tangible' or different others.

___

### price

• **price**: `number`

The price of the store item in the gamification points

___

### ribbon

• **ribbon**: `string`

The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon

___

### limit\_message

• **limit\_message**: `string`

The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false.
   The message is translated to the user language.
   **Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well

___

### priority

• **priority**: `number`

The priority of the store item. Can be used to sort the items in the store

___

### related\_item\_ids

• **related\_item\_ids**: `number`[]

The list of IDs of the related items. Can be used to show the related items in the store

___

### can\_buy

• **can\_buy**: `boolean`

The indicator if the user can buy the item
 This indicator is taking into account the segment conditions for the store item, the price of item towards users balance,

___

### category\_ids

• **category\_ids**: `number`[]

The list of IDs of the categories where the store item is assigned, information about categories can be retrieved with getStoreCategories method

___

### pool

• `Optional` **pool**: `number`

Number of items in the pool avaliable for the purchase.

___

### hint\_text

• `Optional` **hint\_text**: `string`

The T&C text for the store item

___

### purchase\_ts

• `Optional` **purchase\_ts**: `number`

Purchase time to show in purchase history screen

___

### purchase\_points\_amount

• `Optional` **purchase\_points\_amount**: `number`

The amount of points you can purchase an item

___

### purchased\_today

• `Optional` **purchased\_today**: `boolean`

Flag for store item indicating that it was purchased today

___

### purchased\_this\_week

• `Optional` **purchased\_this\_week**: `boolean`

Flag for store item indicating that it was purchased this week

___

### purchased\_this\_month

• `Optional` **purchased\_this\_month**: `boolean`

Flag for store item indicating that it was purchased this month
