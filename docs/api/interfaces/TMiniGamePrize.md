# Interface: TMiniGamePrize

TMiniGamePrize describes the information of prize in the array of prizes in the TMiniGameTemplate

## Properties

### id

> **id**: `number`

ID of the prize

***

### name

> **name**: `string`

The visual name of the prize

***

### prize\_type

> **prize\_type**: [`MiniGamePrizeTypeName`](../enumerations/MiniGamePrizeTypeName.md)

The type of the prize,  no-prize, points, bonus, manual, spin, jackpot

***

### prize\_value?

> `optional` **prize\_value?**: `number`

Numeric value of the prize in case it's 'points' or 'spin' type. For other types of prizes this value is not relevant. 
For example for prize  '100 points' the prize_value will be 100. For '100 free spins' the prize_value will be 100.

***

### font\_size?

> `optional` **font\_size?**: `number`

Custom font size for the prize (desktop)

***

### font\_size\_mobile?

> `optional` **font\_size\_mobile?**: `number`

Custom font size for the prize (mobile)

***

### icon?

> `optional` **icon?**: `string`

The URL of the icon of the prize, aspect ratio 1:1

***

### position

> **position**: `number`

for scratch card defines position of prize in the list

***

### sectors

> **sectors**: `number`[]

List of sectors for the prize

***

### acknowledge\_type

> **acknowledge\_type**: [`SAWAcknowledgeTypeName`](../enumerations/SAWAcknowledgeTypeName.md)

Type of acknowledge message for users

***

### aknowledge\_message

> **aknowledge\_message**: `string`

Message that will be shown to user in modal pop-up

***

### acknowledge\_dp

> **acknowledge\_dp**: `string`

Deep link that will trigger some action in modal pop-up

***

### acknowledge\_action\_title

> **acknowledge\_action\_title**: `string`

The name of the action button in modal pop-up

***

### acknowledge\_dp\_additional?

> `optional` **acknowledge\_dp\_additional?**: `string`

Deep link that will trigger some action in modal pop-up (additional)

***

### acknowledge\_action\_title\_additional?

> `optional` **acknowledge\_action\_title\_additional?**: `string`

The name of the action button in modal pop-up (additional)

***

### out\_of\_stock\_message?

> `optional` **out\_of\_stock\_message?**: `string`

Message when the prize pool is empty for that specific prize

***

### pool?

> `optional` **pool?**: `number`

Number of items in stock

***

### pool\_initial?

> `optional` **pool\_initial?**: `number`

Initial number of items in stock

***

### wins\_count?

> `optional` **wins\_count?**: `number`

Number of wins in game

***

### weekdays?

> `optional` **weekdays?**: `number`[]

Number of days of week, when the prize can be available

***

### active\_from\_ts?

> `optional` **active\_from\_ts?**: `number`

Holds time from which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)

***

### active\_till\_ts?

> `optional` **active\_till\_ts?**: `number`

Holds time till which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)

***

### relative\_period\_timezone?

> `optional` **relative\_period\_timezone?**: `number`

Time zone to ensure each day aligns with your local midnight.

***

### is\_surcharge?

> `optional` **is\_surcharge?**: `boolean`

Flag indicating that the prize is surcharged (available all the time, despite pool numbers)

***

### is\_deleted?

> `optional` **is\_deleted?**: `boolean`

Flag indicating the state of the prize

***

### custom\_data?

> `optional` **custom\_data?**: `any`

The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number

***

### prize\_modifiers?

> `optional` **prize\_modifiers?**: [`PrizeModifiers`](../enumerations/PrizeModifiers.md)[]

Prize modifiers that will multiply by 2x, 5x or 10x the current total. This will not affect the final Prize Amount that will be awarded.

***

### allow\_split\_decimal?

> `optional` **allow\_split\_decimal?**: `boolean`

When enabled, you can split prize value by decimal values

***

### hide\_prize\_from\_history?

> `optional` **hide\_prize\_from\_history?**: `boolean`

When enabled, you can hide prize from prize history

***

### requirements\_to\_get\_prize?

> `optional` **requirements\_to\_get\_prize?**: `string`

Requirements to claim the prize  (lootbox specific)

***

### max\_give\_period\_type\_id?

> `optional` **max\_give\_period\_type\_id?**: [`AttemptPeriodType`](../enumerations/AttemptPeriodType.md)

The period type for the prize to be given: Time from last attempt, Calendar days UTC, Calendar days user time zone, Lifetime
