# Interface: TMissionClaimRewardResult

Response of `_smartico.api.requestMissionClaimReward(mission_id, ach_completed_id)`.

See `requestMissionClaimReward` TSDoc for the full table of `err_code`
values, preconditions, side effects, and recommended UI handling.

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success (rewards credited). See `requestMissionClaimReward` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
