# Interface: TRaffleDraw

## Properties

### id

• **id**: `number`

Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
(internal name: schedule_id)

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

URL of the image that represents the draw, 365x175px

___

### image\_url\_mobile

• **image\_url\_mobile**: `string`

URL of the moible image that represents the draw, 300x145px

___

### icon\_url

• **icon\_url**: `string`

URL of the icon that represents the draw

**`Remarks`**

Square icon target **256×256 px**

___

### background\_image\_url

• **background\_image\_url**: `string`

URL of the background image that will be used in the draw list item

**`Remarks`**

Desktop draw list strip: **900×85 px**.

___

### background\_image\_url\_mobile

• **background\_image\_url\_mobile**: `string`

URL of the moible background image that will be used in the draw list item

**`Remarks`**

Mobile draw list background: **1328×240 px**.

___

### is\_grand

• **is\_grand**: `boolean`

Show if the draw is grand and is marked as special

___

### prizes

• **prizes**: [`TRafflePrize`](TRafflePrize.md)[]

Information about prizes in the draw

___

### current\_state

• **current\_state**: [`RaffleDrawInstanceState`](../enums/RaffleDrawInstanceState.md)

State of current instance of Draw

___

### run\_id

• **run\_id**: `number`

Field indicates the ID of the latest instance/run of draw

___

### execution\_type

• **execution\_type**: [`RaffleDrawTypeExecution`](../enums/RaffleDrawTypeExecution.md)

Type of the draw execution, indicating how and when the draw is executed.
- ExecDate: Draw is executed only once at a specific date and time.
- Recurring: Draw is executed on a recurring basis (e.g., daily, weekly).
- Grand: Draw is executed once and is marked as grand, often with larger prizes or more importance.

___

### execution\_ts

• **execution\_ts**: `number`

Date/time of the draw execution

___

### previous\_run\_ts

• `Optional` **previous\_run\_ts**: `number`

Date of the previously executed draw (if there is such)

___

### previous\_run\_id

• `Optional` **previous\_run\_id**: `number`

Unique ID of the previusly executed draw (if there is such)

___

### ticket\_start\_ts

• **ticket\_start\_ts**: `number`

Date/time starting from which the tickets will participate in the upcoming draw
 This value need to be taken into account with next_execute_ts field value, for example
 Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
 (internally this value is calculated as next_execute_ts - ticket_start_date)

___

### allow\_multi\_prize\_per\_ticket

• **allow\_multi\_prize\_per\_ticket**: `boolean`

Field is indicating if same ticket can win multiple prizes in the same draw
 For example there are 3 types of prizes in the draw - iPhone, iPad, MacBook
 If this field is true, then one ticket can win all 3 prizes (depending on the chances of course),
 if false, then one ticket can win only one prize.
 The distribution of the prizes is start from top (assuming on top are the most valuable prizes) to bottom (less valuable prizes)
 If specific prize has multiple values, e.g. we have 3 iPhones,
 then the same ticket can win only one prize of a kind, but can win multiple prizes of different kind (if allow_multi_prize_per_ticket is true)

___

### total\_tickets\_count

• **total\_tickets\_count**: `number`

The number of tickets that are already given to all users for this instance of draw.
In other words tickets that are collected between ticket_start_date and current time (or till current_execution_ts is the instance is executed).

___

### my\_tickets\_count

• **my\_tickets\_count**: `number`

The number of tickets collected by current user for this instance of draw.

___

### my\_last\_tickets

• **my\_last\_tickets**: [`TRaffleTicket`](TRaffleTicket.md)[]

___

### user\_opted\_in

• **user\_opted\_in**: `boolean`

If true, the user has opted-in to the raffle.

___

### requires\_optin

• **requires\_optin**: `boolean`

If true, the user needs to opt-in to the raffle before they can participate.

___

### is\_active

• **is\_active**: `boolean`

If true, the draw is active and can be participated in.

___

### winners\_limit

• `Optional` **winners\_limit**: `number`

The number of winners to return

___

### winners\_offset

• `Optional` **winners\_offset**: `number`

The offset of the winners to return

___

### winners\_total

• `Optional` **winners\_total**: `number`

The total number of winners
