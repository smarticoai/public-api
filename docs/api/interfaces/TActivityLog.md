# Interface: TActivityLog

One activity-log row from [WSAPIUser.getActivityLog](../classes/WSAPIUser.md#getactivitylog).

Always includes the wallet fields (`type` / `amount` / `balance` / …). When the
server returns richer activity rows (missions, badges, levels, …), the optional
fields below are populated — same method, same CID; clients that ignore unknown
fields keep working.

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

***

### activity\_type\_id?

> `optional` **activity\_type\_id?**: [`ActivityLogActivities`](../enumerations/ActivityLogActivities.md)

Activity kind — see [ActivityLogActivities](../enumerations/ActivityLogActivities.md) (`type` on the wire).

***

### context\_value\_1?

> `optional` **context\_value\_1?**: `number`

Sub-action for `activity_type_id` (e.g. unlock vs complete, add vs deduct, raffle win vs register).

***

### meta?

> `optional` **meta?**: [`ActivityLogMeta`](ActivityLogMeta.md)

Extra display payload for the row (name, image, position, …) — see [ActivityLogMeta](ActivityLogMeta.md).

***

### source\_entity\_name?

> `optional` **source\_entity\_name?**: `string`

Human-readable name of the source entity (mission, tournament, raffle, …).

***

### source\_entity\_id?

> `optional` **source\_entity\_id?**: `number`

Primary id of the source entity (mission / badge / tournament / …).

***

### source\_reference\_id?

> `optional` **source\_reference\_id?**: `number`

More specific id within the source (e.g. level id, draw id, win id).

***

### source\_root\_id?

> `optional` **source\_root\_id?**: `number`

Root / parent entity id when the source is nested (e.g. raffle id owning a draw).

***

### is\_wallet\_entry?

> `optional` **is\_wallet\_entry?**: `boolean`

True when the row is a points/gems/diamonds wallet change.
