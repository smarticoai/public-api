# Interface: TClaimBonusResult

Result of `_smartico.api.claimBonus(bonus_id)`.

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success. See `claimBonus` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.

***

### success?

> `optional` **success?**: `boolean`

Unreliable on the wire — prefer `err_code === 0` as the success check.
