# Interface: TMissionOptInResult

Response of `_smartico.api.requestMissionOptIn(mission_id)`.

See `requestMissionOptIn` TSDoc for the full table of `err_code` values
and recommended UI handling.

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success. See `requestMissionOptIn` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
