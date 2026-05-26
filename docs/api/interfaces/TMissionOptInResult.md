# Interface: TMissionOptInResult

Response of `_smartico.api.requestMissionOptIn(mission_id)`.

See `requestMissionOptIn` TSDoc for the full table of `err_code` values
and recommended UI handling.

## Properties

### err\_code

> **err\_code**: `number`

Error code. `0` = success; `40010` = already opted-in (treat as
idempotent success); `40013` = mission not opt-in-able (draft /
archived / out of window); `40014` = locked (show unlock tasks);
`105` = wrong id or visibility-condition rejection. See
`requestMissionOptIn` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
