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

URL of the image of the store item, 256x256px

___

### type

• **type**: ``"unknown"`` \| ``"bonus"`` \| ``"tangible"`` \| ``"minigamespin"`` \| ``"changelevel"`` \| ``"prizedrop"`` \| ``"raffleticket"``

Type of the store item. Can be 'bonus' or 'tangible' or different others.

___

### price

• **price**: `number`

The price of the store item in the gamification points

___

### ribbon

• **ribbon**: `string`

The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px

___

### limit\_message

• **limit\_message**: `string`

The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false.
The message is translated to the user language.
*Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well

___

### purchase\_limit\_message

• **purchase\_limit\_message**: `string`

The message that should be shown to the user if they are not eligible to buy it because of purchase limitation. This message can be used to explain the reason why user cannot buy the item, e.g. 'Item is no more available today. Come back Friday'.
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

### related\_games

• `Optional` **related\_games**: [`AchRelatedGame`](AchRelatedGame-1.md)[]

List of casino games (or other types of entities) related to the store item

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

### custom\_data

• **custom\_data**: `any`

The custom data of the store item defined by operator. Can be a JSON object, string or number

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

___

### purchase\_type

• **purchase\_type**: ``"points"`` \| ``"gems"`` \| ``"diamonds"``

The type of the purchase

___

### active\_till\_date

• `Optional` **active\_till\_date**: `number`

The date when the store item will be available till

___

### discounted\_price

• `Optional` **discounted\_price**: `number`

The discounted price of the store item

___

### discount\_price\_ribbon

• `Optional` **discount\_price\_ribbon**: `string`

The ribbon of the discounted price.

___

### custom\_ribbon\_image

• `Optional` **custom\_ribbon\_image**: `string`

The custom ribbon image of the discounted price, 250x300px

___

### custom\_section\_id

• `Optional` **custom\_section\_id**: `number`

The ID of the custom section where the store item is assigned

___

### only\_in\_custom\_section

• `Optional` **only\_in\_custom\_section**: `boolean`

The indicator if the store item is visible only in the custom section and should be hidden from the main overview of store items

___

### custom\_section\_type\_id

• `Optional` **custom\_section\_type\_id**: `number`

ID of specific Custom Section type

___

### cant\_buy\_message

• `Optional` **cant\_buy\_message**: `string`

The message that should be shown to the user if they are not eligible to buy it. This message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item'.
