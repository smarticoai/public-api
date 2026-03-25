# Interface: TRaffleDrawRun

## Properties

### id

• **id**: `number`

Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
(internal name: schedule_id)

___

### run\_id

• **run\_id**: `number`

Field indicates the ID of the latest instance/run of draw

___

### name

• **name**: `string`

Name of the draw, e.g. 'Daily draw'

___

### description

• **description**: `string`

Description of the draw

___

### image\_url

• **image\_url**: `string`

URL of the image that represents the draw

**`Remarks`**

Same as [image_url](TRaffleDraw.md#image_url): **365×175 px** desktop promo.

___

### image\_url\_mobile

• **image\_url\_mobile**: `string`

URL of the moible image that represents the draw

**`Remarks`**

Same as [image_url_mobile](TRaffleDraw.md#image_url_mobile): **300×145 px** mobile promo.

___

### icon\_url

• **icon\_url**: `string`

URL of the icon that represents the draw

**`Remarks`**

Same as [icon_url](TRaffleDraw.md#icon_url): **256×256 px** square.

___

### background\_image\_url

• **background\_image\_url**: `string`

URL of the background image that will be used in the draw list item

**`Remarks`**

Same as [background_image_url](TRaffleDraw.md#background_image_url): **900×85 px**.

___

### background\_image\_url\_mobile

• **background\_image\_url\_mobile**: `string`

URL of the moible background image that will be used in the draw list item

**`Remarks`**

Same as [background_image_url_mobile](TRaffleDraw.md#background_image_url_mobile): **1328×240 px**.

___

### is\_grand

• **is\_grand**: `boolean`

Show if the draw is grand and is marked as special

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
