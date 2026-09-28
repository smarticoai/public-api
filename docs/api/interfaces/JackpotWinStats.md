# Interface: JackpotWinStats

## Properties

### total\_wins

> **total\_wins**: `number`

Total number of issued wins of the jackpot template. Wins waiting for manual approval are not counted

***

### highest\_win

> **highest\_win**: [`JackpotWin`](JackpotWin.md)

The biggest win of the jackpot template, `null` when there are no wins yet

***

### last\_win

> **last\_win**: [`JackpotWin`](JackpotWin.md)

The most recent win of the jackpot template, `null` when there are no wins yet
