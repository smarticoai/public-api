# Interface: SAWPrize

## Properties

### saw\_prize\_id

> **saw\_prize\_id**: `number`

***

### saw\_prize\_ui\_definition

> **saw\_prize\_ui\_definition**: [`SAWPrizeUI`](SAWPrizeUI.md)

***

### prize\_value?

> `optional` **prize\_value?**: `number`

***

### prize\_type\_id

> **prize\_type\_id**: [`SAWPrizeType`](../enumerations/SAWPrizeType.md)

***

### place\_from?

> `optional` **place\_from?**: `number`

***

### place\_to?

> `optional` **place\_to?**: `number`

***

### sawUniqueWinId?

> `optional` **sawUniqueWinId?**: `string`

***

### pool?

> `optional` **pool?**: `number`

Remaining stock. Present only when the template's `expose_game_stat_on_api` is enabled; always present for MatchX / Quiz games

***

### pool\_initial?

> `optional` **pool\_initial?**: `number`

Initial (configured) stock. Present regardless of `expose_game_stat_on_api`

***

### wins\_count?

> `optional` **wins\_count?**: `number`

Times the prize has been won, across all players. Present only when `expose_game_stat_on_api` is enabled

***

### weekdays?

> `optional` **weekdays?**: `number`[]

ISO weekday numbers (1 = Monday … 7 = Sunday) the prize can be won on; absent = any day. Present only when `expose_game_stat_on_api` is enabled

***

### active\_from\_ts?

> `optional` **active\_from\_ts?**: `number`

Prize availability window start (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled

***

### active\_till\_ts?

> `optional` **active\_till\_ts?**: `number`

Prize availability window end (epoch ms), evaluated against `relative_period_timezone`. Present only when `expose_game_stat_on_api` is enabled

***

### relative\_period\_timezone?

> `optional` **relative\_period\_timezone?**: `number`

Timezone offset in minutes for `weekdays` / active-window evaluation (UTC minus local, as in JS `Date.getTimezoneOffset()`)

***

### is\_surcharge?

> `optional` **is\_surcharge?**: `boolean`

When true, the prize stays winnable at `pool` 0 (unlimited stock)

***

### is\_deleted?

> `optional` **is\_deleted?**: `boolean`

Always `false` in API responses — deleted prizes are excluded server-side

***

### prize\_details\_json?

> `optional` **prize\_details\_json?**: `object`

#### Index Signature

\[`key`: `string`\]: `any`

***

### max\_give\_period\_type\_id?

> `optional` **max\_give\_period\_type\_id?**: [`AttemptPeriodType`](../enumerations/AttemptPeriodType.md)
