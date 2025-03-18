# Interface: RaffleDrawRun

## Properties

### draw\_id

• **draw\_id**: `number`

Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
(internal name: schedule_id)

___

### run\_id

• **run\_id**: `number`

Field indicates the ID of the latest instance/run of draw

___

### public\_meta

• **public\_meta**: `RaffleDrawPublicMeta`

Meta information of the Draw for the presentaiton in UI

___

### execution\_ts

• **execution\_ts**: `number`

Date/time of the draw execution

___

### actual\_execution\_ts

• **actual\_execution\_ts**: `number`

Actual Date/time of the draw execution

___

### ticket\_start\_ts

• **ticket\_start\_ts**: `number`

Date/time starting from which the tickets will participate in the upcoming draw
 This value need to be taken into account with next_execute_ts field value, for example
 Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
 (internally this value is calculated as next_execute_ts - ticket_start_date)

___

### is\_winner

• **is\_winner**: `boolean`

Shows if user has won a prize in a current run

___

### has\_unclaimed\_prize

• **has\_unclaimed\_prize**: `boolean`

Shows if user has unclaimed prize
