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

### second\_btn?

> `optional` **second\_btn?**: `string`

Deep link that will trigger some action in modal pop-up (second button)

***

### second\_btn\_action\_title?

> `optional` **second\_btn\_action\_title?**: `string`

The name of the action button in modal pop-up (second button)

***

### out\_of\_stock\_message?

> `optional` **out\_of\_stock\_message?**: `string`

Message when the prize pool is empty for that specific prize

***

### pool?

> `optional` **pool?**: `number`

Remaining stock of the prize — decrements on each win, refunded if the spin is finalised as lost. Populated only when the template's `expose_game_stat_on_api` is enabled; always populated for MatchX / Quiz games

***

### pool\_initial?

> `optional` **pool\_initial?**: `number`

Initial (configured) stock of the prize. Populated regardless of `expose_game_stat_on_api`

***

### wins\_count?

> `optional` **wins\_count?**: `number`

Number of times the prize has been won, across all players. Populated only when the template's `expose_game_stat_on_api` is enabled

***

### weekdays?

> `optional` **weekdays?**: `number`[]

ISO weekday numbers (1 = Monday … 7 = Sunday) on which the prize can be won; absent = any day. Populated only when the template's `expose_game_stat_on_api` is enabled

***

### active\_from\_ts?

> `optional` **active\_from\_ts?**: `number`

Time from which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled

***

### active\_till\_ts?

> `optional` **active\_till\_ts?**: `number`

Time until which the prize can be won (epoch ms), evaluated against `relative_period_timezone`. Populated only when the template's `expose_game_stat_on_api` is enabled

***

### relative\_period\_timezone?

> `optional` **relative\_period\_timezone?**: `number`

Timezone offset in minutes used to evaluate `weekdays` and the active window (UTC minus local, as in JS `Date.getTimezoneOffset()` — e.g. `-180` for UTC+3)

***

### is\_surcharge?

> `optional` **is\_surcharge?**: `boolean`

When true, the prize stays winnable even when its `pool` reaches 0 (effectively unlimited stock)

***

### is\_deleted?

> `optional` **is\_deleted?**: `boolean`

Always `false` in API responses — deleted prizes are excluded server-side

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
