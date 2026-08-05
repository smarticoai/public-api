# Interface: JackPotWinPushWinner

One winner entry inside a [JackpotWinPush](JackpotWinPush.md).

Distinct from [JackPotWinner](JackPotWinner.md), which is the winner shape returned by the
`getJackpotWinners()` history — the live win push carries bet / trigger context
and no avatar.

## Properties

### user\_id

> **user\_id**: `number`

Smartico user ID of the winner

***

### ext\_user\_id

> **ext\_user\_id**: `string`

Operator's external user ID of the winner

***

### is\_me

> **is\_me**: `boolean`

Flag indicating that this copy of the push was delivered to the winner themselves

***

### public\_username

> **public\_username**: `string`

Name of the winner, masked for everyone except `is_me` unless masking is disabled by request to Smartico AM team

***

### public\_username\_custom

> **public\_username\_custom**: `string`

Custom display name; falls back to `public_username` when not set

***

### winning\_amount\_jp\_currency

> **winning\_amount\_jp\_currency**: `number`

Won amount in the Jackpot currency; real and bonus parts are combined

***

### winning\_amount\_wallet\_currency

> **winning\_amount\_wallet\_currency**: `number`

Won amount in the user Wallet currency; real and bonus parts are combined

***

### winning\_position

> **winning\_position**: `number`

Position of the winner. Relevant for jackpots where there could be multiple winners

***

### winning\_game\_id

> **winning\_game\_id**: `string`

External game ID of the game whose bet triggered the win; `null` when the triggering bet context is unavailable

***

### winning\_provider\_id

> **winning\_provider\_id**: `string`

External provider ID of the triggering game's provider; `null` when the triggering bet context is unavailable

***

### bet\_original\_date

> **bet\_original\_date**: `number`

Placement time of the triggering bet as reported by the operator (epoch milliseconds) — not the time Smartico processed it; `null` when unavailable

***

### pending\_approve?

> `optional` **pending\_approve?**: `boolean`

Present only on the `is_me` copy; `true` while the win awaits manual approval before payout
