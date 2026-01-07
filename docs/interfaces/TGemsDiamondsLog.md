# Interface: TGemsDiamondsLog

TGemsDiamondsLog describes gems or diamonds change history log entry

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

Type of currency: 'gems' or 'diamonds'

___

### amount

• **amount**: `number`

Amount changed (positive or negative)

___

### balance

• **balance**: `number`

Current balance after this change

___

### source\_type\_id

• **source\_type\_id**: [`PointChangeSourceType`](../enums/PointChangeSourceType.md)

Source type ID indicating what triggered this change
