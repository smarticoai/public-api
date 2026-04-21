# Interface: TRaffleDrawRun

## Properties

### id

> **id**: `number`

Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
(internal name: schedule_id)

***

### run\_id

> **run\_id**: `number`

Field indicates the ID of the latest instance/run of draw

***

### name

> **name**: `string`

Name of the draw, e.g. 'Daily draw'

***

### description

> **description**: `string`

Description of the draw

***

### image\_url

> **image\_url**: `string`

URL of the image that represents the draw

#### Remarks

Same as [TRaffleDraw.image\_url](TRaffleDraw.md#image_url): **365×175 px** desktop promo.

***

### image\_url\_mobile

> **image\_url\_mobile**: `string`

URL of the moible image that represents the draw

#### Remarks

Same as [TRaffleDraw.image\_url\_mobile](TRaffleDraw.md#image_url_mobile): **300×145 px** mobile promo.

***

### icon\_url

> **icon\_url**: `string`

URL of the icon that represents the draw

#### Remarks

Same as [TRaffleDraw.icon\_url](TRaffleDraw.md#icon_url): **256×256 px** square.

***

### background\_image\_url

> **background\_image\_url**: `string`

URL of the background image that will be used in the draw list item

#### Remarks

Same as [TRaffleDraw.background\_image\_url](TRaffleDraw.md#background_image_url): **900×85 px**.

***

### background\_image\_url\_mobile

> **background\_image\_url\_mobile**: `string`

URL of the moible background image that will be used in the draw list item

#### Remarks

Same as [TRaffleDraw.background\_image\_url\_mobile](TRaffleDraw.md#background_image_url_mobile): **1328×240 px**.

***

### is\_grand

> **is\_grand**: `boolean`

Show if the draw is grand and is marked as special

***

### execution\_ts

> **execution\_ts**: `number`

Date/time of the draw execution

***

### actual\_execution\_ts

> **actual\_execution\_ts**: `number`

Actual Date/time of the draw execution

***

### ticket\_start\_ts

> **ticket\_start\_ts**: `number`

Date/time starting from which the tickets will participate in the upcoming draw
 This value need to be taken into account with next_execute_ts field value, for example
 Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
 (internally this value is calculated as next_execute_ts - ticket_start_date)

***

### is\_winner

> **is\_winner**: `boolean`

Shows if user has won a prize in a current run

***

### has\_unclaimed\_prize

> **has\_unclaimed\_prize**: `boolean`

Shows if user has unclaimed prize
