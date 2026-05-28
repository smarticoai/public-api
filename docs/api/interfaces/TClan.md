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

Currency type for `entry_fee_amount`. `0` = points, `1` = gems,
`2` = diamonds, `3` = free (no fee).

***

### entry\_fee\_amount

> **entry\_fee\_amount**: `number`

Entry fee amount in the currency indicated by `entry_fee_currency_type_id`.
`0` (or `entry_fee_currency_type_id === 3`) means the clan is free to join.

***

### rating\_position

> **rating\_position**: `number`

Global rank among all active clans in the label, by `rating_score` DESC.
`1` = highest-rated. May skip positions when some clans are hidden by
per-user visibility (e.g. user sees positions 1, 3, 7).

***

### rating\_score

> **rating\_score**: `number`

Clan rating score (higher is better).
