# Interface: TMiniGamePlayResult

TMiniGamePlayResult describes the response of call to _smartico.api.playMiniGame(template_id) method

## Properties

### err\_code

> **err\_code**: [`SAWSpinErrorCode`](../enumerations/SAWSpinErrorCode.md)

Error code that represents outcome of the game play attempt. Game succeed to be played in case err_code is 0

***

### err\_message

> **err\_message**: `string`

Optional error message

***

### prize\_id

> **prize\_id**: `number`

The prize_id that user won, details of the prize can be found in the mini-game definition
