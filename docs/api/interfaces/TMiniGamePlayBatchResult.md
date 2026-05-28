# Interface: TMiniGamePlayBatchResult

TMiniGamePlayBatchResult describes one entry in the array returned
by `_smartico.api.playMiniGameBatch(template_id, spin_count)`.

Note: this type uses `errCode` / `errMessage` (camelCase) —
different from `TMiniGamePlayResult` which uses `err_code` /
`err_message` (snake_case).

## Properties

### saw\_prize\_id

> **saw\_prize\_id**: `number`

ID of the won prize for this spin. Look up in `template.prizes`.

***

### errCode

> **errCode**: [`SAWSpinErrorCode`](../enumerations/SAWSpinErrorCode.md)

Error code. `0` = success. See `playMiniGameBatch` TSDoc for the
full table.

***

### errMessage?

> `optional` **errMessage?**: `string`

Optional server-side error message.

***

### jackpot\_amount?

> `optional` **jackpot\_amount?**: `number`

Jackpot amount the user won, populated when the prize type is
`'jackpot'`.

***

### first\_spin\_in\_period?

> `optional` **first\_spin\_in\_period?**: `number`

Epoch ms of the user's first spin in the current cooldown
period; populated when `errCode === SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`.
