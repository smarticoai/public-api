# Interface: TClanInfo

TClanInfo describes the detailed info of a single clan including its members.

## Properties

### clan\_id

> **clan\_id**: `number`

***

### public\_meta

> **public\_meta**: `object`

#### name

> **name**: `string`

#### description

> **description**: `string`

#### image\_url

> **image\_url**: `string`

***

### member\_count

> **member\_count**: `number`

***

### capacity\_limit

> **capacity\_limit**: `number`

***

### entry\_fee\_currency\_type\_id

> **entry\_fee\_currency\_type\_id**: `number`

***

### entry\_fee\_amount

> **entry\_fee\_amount**: `number`

***

### rating\_position

> **rating\_position**: `number`

***

### rating\_score

> **rating\_score**: `number`

***

### cooldown\_until

> **cooldown\_until**: `string`

***

### members

> **members**: `object`[]

#### user\_id

> **user\_id**: `number`

#### public\_username

> **public\_username**: `string`

#### avatar\_id

> **avatar\_id**: `string`

#### avatar\_real\_id

> **avatar\_real\_id**: `number`

#### avatar\_url?

> `optional` **avatar\_url?**: `string`

#### position

> **position**: `number`

#### contribution\_score

> **contribution\_score**: `number`

#### is\_me?

> `optional` **is\_me?**: `boolean`

#### clean\_ext\_user\_id?

> `optional` **clean\_ext\_user\_id?**: `string`
