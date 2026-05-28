# Interface: TSegmentCheckResult

TSegmentCheckResult describes one segment-membership outcome.
Returned by `_smartico.api.checkSegmentListMatch()` (and used
internally by `checkSegmentMatch()`).

## Properties

### segment\_id

> **segment\_id**: `number`

The segment ID this result refers to (label-scoped).

***

### is\_matching

> **is\_matching**: `boolean`

`true` if the user currently matches this segment. `false` also
covers the case where the segment doesn't exist for the label —
the two are not distinguishable.
