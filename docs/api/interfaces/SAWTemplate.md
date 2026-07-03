# Interface: SAWTemplate

## Properties

### saw\_template\_id

> **saw\_template\_id**: `number`

ID of the mini-game template

***

### saw\_game\_type\_id

> **saw\_game\_type\_id**: [`SAWGameType`](../enumerations/SAWGameType.md)

The type of the game — see [SAWGameType](../enumerations/SAWGameType.md)

***

### saw\_template\_ui\_definition

> **saw\_template\_ui\_definition**: [`SAWTemplateUI`](SAWTemplateUI.md)

Full UI definition of the mini-game (name, description, skin, colors, per-game visual settings)

***

### saw\_buyin\_type\_id

> **saw\_buyin\_type\_id**: [`SAWBuyInType`](../enumerations/SAWBuyInType.md)

How the user is charged per attempt — see [SAWBuyInType](../enumerations/SAWBuyInType.md)

***

### buyin\_cost\_points?

> `optional` **buyin\_cost\_points?**: `number`

Cost per attempt in the buy-in currency (points, gems or diamonds per `saw_buyin_type_id`)

***

### visibile\_when\_can\_spin

> **visibile\_when\_can\_spin**: `boolean`

Operator hint: show the game only while the user can actually play it (has attempts / sufficient balance)

***

### spin\_count?

> `optional` **spin\_count?**: `number`

Number of spin attempts the user currently has (initial value; later changes arrive as spin-count pushes)

***

### prizes

> **prizes**: [`SAWPrize`](SAWPrize.md)[]

Prizes configured for this game — see [SAWPrize](SAWPrize.md)

***

### is\_visible

> **is\_visible**: `boolean`

Operator visibility flag for the template

***

### activeFromDate?

> `optional` **activeFromDate?**: `number`

Time from which the template becomes available (epoch ms); absent when not restricted

***

### activeTillDate?

> `optional` **activeTillDate?**: `number`

Time until which the template stays available (epoch ms); absent when not restricted

***

### jackpot\_add\_on\_attempt

> **jackpot\_add\_on\_attempt**: `number`

Amount added to the jackpot on every play (abstract contribution — nothing is deducted from the player)

***

### jackpot\_current

> **jackpot\_current**: `number`

Current jackpot accumulator value

***

### jackpot\_guaranteed

> **jackpot\_guaranteed**: `number`

Seed value of the jackpot — the accumulator starts at (and resets to) this amount after a jackpot win

***

### maxActiveSpinsAllowed

> **maxActiveSpinsAllowed**: `number`

Maximum number of unspent spin attempts a user can accumulate

***

### maxSpinsCount

> **maxSpinsCount**: `number`

Maximum number of attempts a user can make during `maxSpinsPediodMs`

***

### maxSpinsPediodMs

> **maxSpinsPediodMs**: `number`

Length of the attempt-limit period in ms (note the field-name spelling)

***

### next\_available\_spin\_ts?

> `optional` **next\_available\_spin\_ts?**: `number`

Epoch-ms time when the next attempt becomes available; populated only when the operator enabled the "show time to the next available spin" setting and max attempts per period is 1

***

### earliest\_expiration\_dt?

> `optional` **earliest\_expiration\_dt?**: `number`

Soonest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins.

***

### latest\_expiration\_dt?

> `optional` **latest\_expiration\_dt?**: `number`

Latest-expiring spin's expiration time for this user (epoch ms); `null`/absent when no expirable spins.

***

### saw\_skin\_key

> **saw\_skin\_key**: `string`

Key of the visual skin the operator selected for the game

***

### saw\_skin\_ui\_definition

> **saw\_skin\_ui\_definition**: `object`

Skin assets of the game: `skin_folder` is the base URL for the skin's images, `skin_css` custom CSS overrides, plus optional popup/animation tweaks

#### skin\_folder

> **skin\_folder**: `string`

#### skin\_css

> **skin\_css**: `string`

#### use\_new\_popups?

> `optional` **use\_new\_popups?**: `boolean`

#### lottie\_animation\_speed?

> `optional` **lottie\_animation\_speed?**: `number`

***

### expose\_game\_stat\_on\_api?

> `optional` **expose\_game\_stat\_on\_api?**: `boolean`

Operator template setting. When enabled, the per-prize stock statistics (`pool`, `wins_count`, `weekdays`, `active_from_ts` / `active_till_ts`) are populated on `prizes`; when disabled (default) the server strips them from the response (`pool` is kept for MatchX / Quiz games).

***

### requires\_prize\_claim?

> `optional` **requires\_prize\_claim?**: `boolean`

Prize Drop only: when true, the pushed prize requires an explicit claim by the user before it is credited

***

### relative\_period\_timezone?

> `optional` **relative\_period\_timezone?**: `number`

Timezone offset in minutes used to evaluate the template's period-based rules (UTC minus local, as in JS `Date.getTimezoneOffset()`)

***

### show\_prize\_history?

> `optional` **show\_prize\_history?**: `boolean`

Operator setting: show a prize-history entry point (icon / button) on this game's view
