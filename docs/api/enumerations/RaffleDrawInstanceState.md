# Enumeration: RaffleDrawInstanceState

## Enumeration Members

### Open

> **Open**: `1`

Draw is open for the tickets collection

***

### WinnerSelection

> **WinnerSelection**: `2`

Winner selection is in progress

***

### Executed

> **Executed**: `3`

Draw is executed and the winners are selected

***

### Cancelled

> **Cancelled**: `4`

Draw was cancelled and will never be executed.
Treat it as a terminal state: stop any polling of the draw run
and do not show the winner-selection progress UI.
