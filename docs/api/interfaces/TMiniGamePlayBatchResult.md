# Interface: TMiniGamePlayBatchResult

TMiniGamePlayBatchResult describes the response of call to _smartico.api.playMiniGameBatch(template_id, spin_count) method

## Properties

### saw\_prize\_id

> **saw\_prize\_id**: `number`

The saw_prize_id that user won, details of the prize can be found in the mini-game definition

***

### errCode

> **errCode**: [`SAWSpinErrorCode`](../enumerations/SAWSpinErrorCode.md)

Error code that represents outcome of the game play attempt. Game succeed to be played in case err_code is 0

***

### errMessage?

> `optional` **errMessage?**: `string`

Optional error message

***

### jackpot\_amount?

> `optional` **jackpot\_amount?**: `number`

Jackpot amount what user won

***

### first\_spin\_in\_period?

> `optional` **first\_spin\_in\_period?**: `number`

Period in miliseconds from last spin
