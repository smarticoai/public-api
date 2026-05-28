# Interface: TransformedRaffleClaimPrizeResponse

Result of `_smartico.api.claimRafflePrize({raffle_id, draw_id, raffle_run_id})`.
Uses camelCase `errorCode` / `errorMessage` — distinct from most other SDK
result wrappers which use snake_case `err_code` / `err_message`.

## Properties

### errorCode

> **errorCode**: `number`

Error code. `0` = success. See `claimRafflePrize` TSDoc for the full table.

***

### errorMessage?

> `optional` **errorMessage?**: `string`

Optional error message; populated on non-zero `errorCode`.
