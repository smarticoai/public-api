# Interface: TClan

TClan describes one clan item from the clans list.

## Properties

### clan\_id

> **clan\_id**: `number`

Clan ID

***

### public\_meta

> **public\_meta**: `object`

Translated clan metadata

#### name

> **name**: `string`

#### description

> **description**: `string`

#### image\_url

> **image\_url**: `string`

***

### member\_count

> **member\_count**: `number`

Current number of members in clan

***

### capacity\_limit

> **capacity\_limit**: `number`

Max number of members allowed in clan

***

### entry\_fee\_currency\_type\_id

> **entry\_fee\_currency\_type\_id**: `number`

ShopPurchaseType: 0=Points, 1=Gems, 2=Diamonds, 3=Free

***

### entry\_fee\_amount

> **entry\_fee\_amount**: `number`

Numeric value for entry fee

***

### rating\_position

> **rating\_position**: `number`

F1 rank ASC, 1=best

***

### rating\_score

> **rating\_score**: `number`

Clan rating score
