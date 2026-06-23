# Enumeration: GPRoundStatus

GPRoundStatus defines the lifecycle stage of a game round

## Enumeration Members

### Other

> **Other**: `-1`

Round is in an active/other state

***

### NoEventsDefined

> **NoEventsDefined**: `1`

Round exists but has no events defined yet

***

### NoMoreBetsAllowed

> **NoMoreBetsAllowed**: `2`

Betting deadline has passed, no more bets allowed

***

### AllEventsResolved\_ButNotRound

> **AllEventsResolved\_ButNotRound**: `3`

All events in the round are resolved, but the round itself is not finalized

***

### RoundResolved

> **RoundResolved**: `4`

Round is fully resolved and scored
