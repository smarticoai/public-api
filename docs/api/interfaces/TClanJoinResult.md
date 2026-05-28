# Interface: TClanJoinResult

TClanJoinResult describes the result of a join-clan request.
Note: this type uses `errCode` / `errMsg` (camelCase) — different
from most other SDK result types in this library which use
`err_code` / `err_message` (snake_case).

## Properties

### errCode

> **errCode**: `number`

Error code. `0` = success. Typed values are members of
[JoinClanErrorCode](../enumerations/JoinClanErrorCode.md). See `joinClan` TSDoc for the full
table and per-code UI guidance.

***

### errMsg

> **errMsg**: `string`

Optional server-side error message. Present only on non-zero
`errCode`; may be empty even then.
