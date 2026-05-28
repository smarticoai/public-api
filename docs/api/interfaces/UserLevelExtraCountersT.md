# Interface: UserLevelExtraCountersT

UserLevelExtraCountersT exposes the user's current values for the two
label-defined sliding-window level counters. Returned by
`_smartico.api.getUserLevelExtraCounters()`. Both fields are
`undefined` on points-only labels.

## Properties

### level\_counter\_1?

> `optional` **level\_counter\_1?**: `number`

Current value of the user's first level counter. Operator-defined
semantics per label. `undefined` on points-only labels.

***

### level\_counter\_2?

> `optional` **level\_counter\_2?**: `number`

Current value of the user's second level counter. Operator-defined
semantics per label. `undefined` on points-only labels.
