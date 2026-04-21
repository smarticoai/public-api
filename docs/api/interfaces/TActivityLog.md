# Interface: TActivityLog

TActivityLog describes a unified history log entry for points, gems, or diamonds changes.
The structure is the same regardless of balance type, making it easy to iterate and display.

## Properties

### create\_date

> **create\_date**: `number`

Date when the change was created (epoch timestamp in seconds)

***

### user\_ext\_id

> **user\_ext\_id**: `string`

External user ID

***

### crm\_brand\_id

> **crm\_brand\_id**: `number`

CRM brand ID

***

### type

> **type**: [`UserBalanceType`](../enumerations/UserBalanceType.md)

Type of balance: Points = 0, Gems = 1, Diamonds = 2

***

### amount

> **amount**: `number`

Amount changed (positive or negative)

***

### balance

> **balance**: `number`

Current balance after this change

***

### total\_ever?

> `optional` **total\_ever?**: `number`

Total ever collected (only relevant for type points)

***

### source\_type\_id

> **source\_type\_id**: [`PointChangeSourceType`](../enumerations/PointChangeSourceType.md)

Source type ID indicating what triggered this change
