# Interface: ActivityLogEntry

One raw activity-log row as it arrives on the wire.

JS consumers receive the friendlier [TActivityLog](TActivityLog.md) instead — this is the
pre-transform shape, documented for native clients that read the protocol directly.

## Properties

### create\_date

> **create\_date**: `object`

Creation time; `seconds` is the epoch value in SECONDS (not ms).

#### seconds

> **seconds**: `number`

#### nanos?

> `optional` **nanos?**: `number`

***

### user\_ext\_id

> **user\_ext\_id**: `string`

***

### crm\_brand\_id

> **crm\_brand\_id**: `string`

Sent as a string on the wire.

***

### type

> **type**: [`ActivityLogActivities`](../enumerations/ActivityLogActivities.md)

Kind of activity this row records.

***

### ctx\_1

> **ctx\_1**: `number`

Sub-action within `type` (e.g. unlock vs complete, add vs deduct).

***

### ctx\_meta?

> `optional` **ctx\_meta?**: [`ActivityLogMeta`](ActivityLogMeta.md)

Extra display payload for the row; contents vary by `type`.

***

### source\_type\_id

> **source\_type\_id**: [`PointChangeSourceType`](../enumerations/PointChangeSourceType.md)

What triggered the change.

***

### source\_ref\_id

> **source\_ref\_id**: `number`

More specific id within the source (e.g. level id, draw id, win id).

***

### source\_root\_id

> **source\_root\_id**: `number`

Root / parent entity id when the source is nested.

***

### amount

> **amount**: `number`

Delta applied by this row, in the balance named by `type`.

***

### balance

> **balance**: `number`

Balance after this row, in the balance named by `type`.

***

### user\_points\_balance?

> `optional` **user\_points\_balance?**: `number`

Points balance after this row; points rows only.

***

### user\_points\_ever?

> `optional` **user\_points\_ever?**: `number`

Total points ever collected after this row; points rows only.

***

### points\_collected?

> `optional` **points\_collected?**: `number`

Placeholder on points rows (`-1`) — read `amount` for the real delta.
