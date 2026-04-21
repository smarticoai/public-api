# Interface: TStoreItem

TStoreItem describes the information of the store item defined in the system

## Properties

### id

> **id**: `number`

ID of the store item

***

### name

> **name**: `string`

Name of the store item, translated to the user language

***

### description

> **description**: `string`

Description of the store item, translated to the user language

***

### image

> **image**: `string`

URL of the image of the store item, 256x256px

***

### type

> **type**: `"unknown"` \| `"bonus"` \| `"tangible"` \| `"minigamespin"` \| `"changelevel"` \| `"prizedrop"` \| `"raffleticket"`

Type of the store item. Can be 'bonus' or 'tangible' or different others.

***

### price

> **price**: `number`

The price of the store item in the gamification points

***

### ribbon

> **ribbon**: `string`

The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px

***

### limit\_message

> **limit\_message**: `string`

The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false.
The message is translated to the user language.
*Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well

***

### purchase\_limit\_message

> **purchase\_limit\_message**: `string`

The message that should be shown to the user if they are not eligible to buy it because of purchase limitation. This message can be used to explain the reason why user cannot buy the item, e.g. 'Item is no more available today. Come back Friday'.
The message is translated to the user language.
**Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well

***

### priority

> **priority**: `number`

The priority of the store item. Can be used to sort the items in the store

***

### related\_item\_ids

> **related\_item\_ids**: `number`[]

The list of IDs of the related items. Can be used to show the related items in the store

***

### related\_games?

> `optional` **related\_games?**: [`AchRelatedGame`](AchRelatedGame-1.md)[]

List of casino games (or other types of entities) related to the store item

***

### can\_buy

> **can\_buy**: `boolean`

The indicator if the user can buy the item
 This indicator is taking into account the segment conditions for the store item, the price of item towards users balance,

***

### category\_ids

> **category\_ids**: `number`[]

The list of IDs of the categories where the store item is assigned, information about categories can be retrieved with getStoreCategories method

***

### pool?

> `optional` **pool?**: `number`

Number of items in the pool avaliable for the purchase.

***

### custom\_data

> **custom\_data**: `any`

The custom data of the store item defined by operator. Can be a JSON object, string or number

***

### hint\_text?

> `optional` **hint\_text?**: `string`

The T&C text for the store item

***

### purchase\_ts?

> `optional` **purchase\_ts?**: `number`

Purchase time to show in purchase history screen

***

### purchase\_points\_amount?

> `optional` **purchase\_points\_amount?**: `number`

The amount of points you can purchase an item

***

### purchased\_today?

> `optional` **purchased\_today?**: `boolean`

Flag for store item indicating that it was purchased today

***

### purchased\_this\_week?

> `optional` **purchased\_this\_week?**: `boolean`

Flag for store item indicating that it was purchased this week

***

### purchased\_this\_month?

> `optional` **purchased\_this\_month?**: `boolean`

Flag for store item indicating that it was purchased this month

***

### purchase\_type

> **purchase\_type**: `"points"` \| `"gems"` \| `"diamonds"`

The type of the purchase

***

### active\_till\_date?

> `optional` **active\_till\_date?**: `number`

The date when the store item will be available till

***

### discounted\_price?

> `optional` **discounted\_price?**: `number`

The discounted price of the store item

***

### discount\_price\_ribbon?

> `optional` **discount\_price\_ribbon?**: `string`

The ribbon of the discounted price.

***

### custom\_ribbon\_image?

> `optional` **custom\_ribbon\_image?**: `string`

The custom ribbon image of the discounted price, 250x300px

***

### custom\_section\_id?

> `optional` **custom\_section\_id?**: `number`

The ID of the custom section where the store item is assigned

***

### only\_in\_custom\_section?

> `optional` **only\_in\_custom\_section?**: `boolean`

The indicator if the store item is visible only in the custom section and should be hidden from the main overview of store items

***

### custom\_section\_type\_id?

> `optional` **custom\_section\_type\_id?**: `number`

ID of specific Custom Section type

***

### cant\_buy\_message?

> `optional` **cant\_buy\_message?**: `string`

The message that should be shown to the user if they are not eligible to buy it. This message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item'.
