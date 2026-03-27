# Enumeration: GPRoundStatus

GPRoundStatus defines the lifecycle stage of a game round

## Enumeration Members

### Other

• **Other** = ``-1``

Round is in an active/other state

___

### NoEventsDefined

• **NoEventsDefined** = ``1``

Round exists but has no events defined yet

___

### NoMoreBetsAllowed

• **NoMoreBetsAllowed** = ``2``

Betting deadline has passed, no more bets allowed

___

### AllEventsResolved\_ButNotRound

• **AllEventsResolved\_ButNotRound** = ``3``

All events in the round are resolved, but the round itself is not finalized

___

### RoundResolved

• **RoundResolved** = ``4``

Round is fully resolved and scored
