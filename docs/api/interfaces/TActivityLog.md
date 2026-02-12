# Interface: TActivityLog

TActivityLog describes a unified history log entry for points, gems, or diamonds changes.
The structure is the same regardless of balance type, making it easy to iterate and display.

## Properties

### create\_date

• **create\_date**: `number`

Date when the change was created (epoch timestamp in seconds)

___

### user\_ext\_id

• **user\_ext\_id**: `string`

External user ID

___

### crm\_brand\_id

• **crm\_brand\_id**: `number`

CRM brand ID

___

### type

• **type**: [`UserBalanceType`](../enums/UserBalanceType.md)

Type of balance: Points = 0, Gems = 1, Diamonds = 2

___

### amount

• **amount**: `number`

Amount changed (positive or negative)

___

### balance

• **balance**: `number`

Current balance after this change

___

### total\_ever

• `Optional` **total\_ever**: `number`

Total ever collected (only relevant for type points)

___

### source\_type\_id

• **source\_type\_id**: [`PointChangeSourceType`](../enums/PointChangeSourceType.md)

Source type ID indicating what triggered this change
