# Interface: TActivityLogEntry

Full activity-log row returned by [WSAPIUser.getActivityLogV2](../classes/WSAPIUser.md#getactivitylogv2).
Includes wallet changes and non-wallet activities (missions, badges, levels, …).

## Properties

### create\_date

> **create\_date**: `number`

***

### user\_ext\_id

> **user\_ext\_id**: `string`

***

### crm\_brand\_id

> **crm\_brand\_id**: `number`

***

### type

> **type**: [`UserBalanceType`](../enumerations/UserBalanceType.md)

***

### amount

> **amount**: `number`

***

### balance

> **balance**: `number`

***

### total\_ever?

> `optional` **total\_ever?**: `number`

***

### source\_type\_id

> **source\_type\_id**: [`PointChangeSourceType`](../enumerations/PointChangeSourceType.md)

***

### activity\_type\_id?

> `optional` **activity\_type\_id?**: [`ActivityLogActivities`](../enumerations/ActivityLogActivities.md)

***

### context\_value\_1?

> `optional` **context\_value\_1?**: `number`

***

### meta?

> `optional` **meta?**: [`ActivityLogMeta`](ActivityLogMeta.md)

***

### source\_entity\_name?

> `optional` **source\_entity\_name?**: `string`

***

### source\_entity\_id?

> `optional` **source\_entity\_id?**: `number`

***

### source\_reference\_id?

> `optional` **source\_reference\_id?**: `number`

***

### source\_root\_id?

> `optional` **source\_root\_id?**: `number`

***

### is\_wallet\_entry

> **is\_wallet\_entry**: `boolean`
