# Interface: JackpotPot

Live snapshot of one jackpot pot's value and temperature.
Embedded on `JackpotDetails.pot`; refreshed at the 1 s SDK cache TTL.

## Properties

### jp\_template\_id

> **jp\_template\_id**: `number`

Template ID this pot belongs to.

***

### jp\_pot\_id

> **jp\_pot\_id**: `number`

Stable numeric ID of the current pot instance (rotates when the pot explodes).

***

### current\_pot\_amount

> **current\_pot\_amount**: `number`

Current pot amount in the jackpot's native currency (`jp_currency`).

***

### current\_pot\_amount\_user\_currency

> **current\_pot\_amount\_user\_currency**: `number`

Current pot amount converted to the user's wallet currency (`user_currency`).

***

### explode\_date\_ts

> **explode\_date\_ts**: `number`

Unix ms timestamp of when this pot last exploded; `0` if it has never exploded.

***

### current\_pot\_temperature

> **current\_pot\_temperature**: [`JackPotTemparature`](../enumerations/JackPotTemparature.md)

Heat band of the pot relative to its explosion range; see [JackPotTemparature](../enumerations/JackPotTemparature.md).
