# Interface: TPointsLog

TPointsLog describes points change history log entry

## Properties

### create\_date

• **create\_date**: `number`

Date when the points change was created (epoch timestamp in seconds)

___

### user\_ext\_id

• **user\_ext\_id**: `string`

External user ID

___

### crm\_brand\_id

• **crm\_brand\_id**: `number`

CRM brand ID

___

### points\_collected

• **points\_collected**: `number`

Amount of points collected (positive or negative)

___

### user\_points\_ever

• **user\_points\_ever**: `number`

Total points user ever collected

___

### user\_points\_balance

• **user\_points\_balance**: `number`

Current points balance after this change

___

### source\_type\_id

• **source\_type\_id**: [`PointChangeSourceType`](../enums/PointChangeSourceType.md)

Source type ID indicating what triggered this points change
