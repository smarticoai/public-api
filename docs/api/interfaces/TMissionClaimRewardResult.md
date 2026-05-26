# Interface: TMissionClaimRewardResult

Response of `_smartico.api.requestMissionClaimReward(mission_id, ach_completed_id)`.

See `requestMissionClaimReward` TSDoc for the full table of `err_code`
values, preconditions, side effects, and recommended UI handling.

## Properties

### err\_code

> **err\_code**: `number`

Error code that represents outcome of the claim request.
`0` = success (rewards have been credited);
`40017` = already claimed (treat as idempotent success);
`40015` = claim window expired;
`40016` = mission not completed yet (stale local state);
`1` = generic server error (stale `ach_completed_id`, archived/draft
mission, label mismatch, completion older than 6 months, or
`requires_prize_claim=false` on the server). See
`requestMissionClaimReward` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
