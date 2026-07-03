# Interface: TMiniGamePrize

TMiniGamePrize describes the information of prize in the array of prizes in the TMiniGameTemplate

## Properties

### id

> **id**: `number`

ID of the prize

***

### name

> **name**: `string`

Display name of the prize, pre-translated; any jackpot placeholder in it arrives resolved to the live jackpot value

***

### prize\_type

> **prize\_type**: [`MiniGamePrizeTypeName`](../enumerations/MiniGamePrizeTypeName.md)

The type of the prize — see [MiniGamePrizeTypeName](../enumerations/MiniGamePrizeTypeName.md) ('no-prize', 'points', 'gems-and-diamonds', 'spin', 'bonus', 'jackpot', 'raffle-ticket', 'mission', 'change-level', 'manual')

***

### prize\_value?

> `optional` **prize\_value?**: `number`

Numeric value of the prize in case it's 'points' or 'spin' type. For other types of prizes this value is not relevant.
For example for prize  '100 points' the prize_value will be 100. For '100 free spins' the prize_value will be 100.

***

### font\_size?

> `optional` **font\_size?**: `number`

Custom font size in px for rendering the prize name on the game surface (e.g. a wheel sector), desktop

***

### font\_size\_mobile?

> `optional` **font\_size\_mobile?**: `number`

Custom font size in px for the prize name, mobile; falls back to `font_size` when absent

***

### icon?

> `optional` **icon?**: `string`

The URL of the icon of the prize, aspect ratio 1:1

***

### position

> **position**: `number`

For Scratch Card games — relative order of the prize in the scratch grid (lower first). May be absent for other game types

***

### sectors

> **sectors**: `number`[]

For Spin-a-Wheel games — wheel sector indices this prize occupies. Absent for non-wheel games

***

### acknowledge\_type

> **acknowledge\_type**: [`SAWAcknowledgeTypeName`](../enumerations/SAWAcknowledgeTypeName.md)

Which win modal the prize uses — see [SAWAcknowledgeTypeName](../enumerations/SAWAcknowledgeTypeName.md) (Silent / QuickMessage / FullMessage / ExplicitAcknowledge)

***

### aknowledge\_message

> **aknowledge\_message**: `string`

Message that will be shown to user in modal pop-up

***

### aknowledge\_message\_lose?

> `optional` **aknowledge\_message\_lose?**: `string`

Message shown instead of `aknowledge_message` when the spin is finalised as lost (`lose: true` acknowledge flows — games with a client-decided outcome, e.g. Voyager). Absent unless configured

***

### acknowledge\_dp

> **acknowledge\_dp**: `string`

Deep link executed when the user taps the main action button in the win modal (run it via `_smartico.dp()`)

***

### acknowledge\_action\_title

> **acknowledge\_action\_title**: `string`

Label of the main action button in the win modal

***

### acknowledge\_dp\_additional?

> `optional` **acknowledge\_dp\_additional?**: `string`

Deep link of the additional action button in the win modal

***

### acknowledge\_action\_title\_additional?

> `optional` **acknowledge\_action\_title\_additional?**: `string`

Label of the additional action button in the win modal

***

### second\_btn?

> `optional` **second\_btn?**: `string`

Deep link of the secondary button in the win modal

***

### second\_btn\_action\_title?

> `optional` **second\_btn\_action\_title?**: `string`

Label of the secondary button in the win modal

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

The custom data of the prize defined by the operator. Can be a JSON object, string or number

***

### prize\_modifiers?

> `optional` **prize\_modifiers?**: [`PrizeModifiers`](../enumerations/PrizeModifiers.md)[]

Step-modifier tiles for step games (Treasure Hunt / Voyager) — see [PrizeModifiers](../enumerations/PrizeModifiers.md) (2x / 5x / 10x, /2 / /5 / /10, 0, reset) applied to the running total revealed during the game. Presentation only — the awarded amount is still `prize_value`

***

### allow\_split\_decimal?

> `optional` **allow\_split\_decimal?**: `boolean`

Step games (Treasure Hunt / Voyager): when true, the per-step revealed amounts of the prize value may be fractional; when false the split uses whole numbers

***

### hide\_prize\_from\_history?

> `optional` **hide\_prize\_from\_history?**: `boolean`

Operator hint to hide this prize when rendering prize-history UIs. Informational only — API responses are not filtered by it

***

### requirements\_to\_get\_prize?

> `optional` **requirements\_to\_get\_prize?**: `string`

Operator text describing what the user must do to be eligible for this prize (lootbox games); shown when the prize is not yet available to the user

***

### max\_give\_period\_type\_id?

> `optional` **max\_give\_period\_type\_id?**: [`AttemptPeriodType`](../enumerations/AttemptPeriodType.md)

Period basis for the prize availability restriction — see [AttemptPeriodType](../enumerations/AttemptPeriodType.md). `CalendarDaysUserTimeZone` evaluates `weekdays` / the active window in the user's timezone; the other types use `relative_period_timezone`
