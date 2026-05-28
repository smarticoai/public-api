# Interface: JackpotDetails

One jackpot template the user is eligible for, with its live pot snapshot.
Returned by `jackpotGet()`.

## Properties

### jp\_template\_id

> **jp\_template\_id**: `number`

Stable numeric ID of the template; pass to opt-in / opt-out / winners / eligible-games methods.

***

### jp\_type\_id

> **jp\_type\_id**: [`JackpotType`](../enumerations/JackpotType.md)

Whether the jackpot has a shared pot or one independent per user; see [JackpotType](../enumerations/JackpotType.md).

***

### jp\_public\_meta

> **jp\_public\_meta**: [`JackpotPublicMeta`](JackpotPublicMeta.md)

Display data: name, description, image_url, winner / not-winner HTML templates, custom_data (JSON-parsed).

***

### jp\_currency

> **jp\_currency**: `string`

Native jackpot currency (ISO 4217). Used for winner-history amounts.

***

### user\_currency

> **user\_currency**: `string`

Current user's wallet currency. Used to display the pot via `pot.current_pot_amount_user_currency`.

***

### contribution\_type

> **contribution\_type**: [`JackpotContributionType`](../enumerations/JackpotContributionType.md)

Whether the contribution is a fixed amount or a percentage of the bet; see [JackpotContributionType](../enumerations/JackpotContributionType.md).

***

### contribution\_value

> **contribution\_value**: `number`

Amount of contribution per qualifying bet — fixed value or percentage depending on `contribution_type`.

***

### pot

> **pot**: [`JackpotPot`](JackpotPot.md)

Live pot snapshot (amount, temperature, last explosion timestamp).

***

### is\_opted\_in

> **is\_opted\_in**: `boolean`

`true` when the current user is currently opted in.

***

### ach\_related\_game\_allow\_all

> **ach\_related\_game\_allow\_all**: `boolean`

`true` when every game in the operator catalog contributes; if `true`, skip `getJackpotEligibleGames`.

***

### registration\_count

> **registration\_count**: `number`

Number of users currently opted in; always `1` for `JackpotType.Personal`.

***

### expose\_winners\_over\_api

> **expose\_winners\_over\_api**: `boolean`

Operator flag: whether the winners list should be displayed. Enforced client-side only — gate `getJackpotWinners` calls on this.
