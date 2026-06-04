# Enumeration: JoinClanErrorCode

Error codes returned in `errCode` by the `joinClan` method (also carried
on `TClanJoinResult`). These are terse value definitions for lookup; the
full per-code narrative and UI handling lives in the `joinClan` method
TSDoc, which owns the error table.

## Enumeration Members

### JOIN\_CLAN\_OK

> **JOIN\_CLAN\_OK**: `0`

Success — join completed; entry fee (if any) deducted.

***

### JOIN\_CLAN\_INVALID\_PARAMETERS

> **JOIN\_CLAN\_INVALID\_PARAMETERS**: `1000`

Request was malformed (missing or invalid parameters).

***

### JOIN\_CLAN\_NOT\_FOUND

> **JOIN\_CLAN\_NOT\_FOUND**: `1001`

Clan doesn't exist for this label. Archived clans are also reported as `1001`.

***

### JOIN\_CLAN\_FULL

> **JOIN\_CLAN\_FULL**: `1002`

Clan is full — member capacity reached.

***

### JOIN\_CLAN\_INSUFFICIENT\_FUNDS

> **JOIN\_CLAN\_INSUFFICIENT\_FUNDS**: `1003`

Insufficient balance for the entry fee (points / gems / diamonds).

***

### JOIN\_CLAN\_SEGMENT\_MISMATCH

> **JOIN\_CLAN\_SEGMENT\_MISMATCH**: `1004`

User doesn't meet the clan's entry segment or conditions.

***

### JOIN\_CLAN\_USER\_IS\_NOT\_IN\_CLAN

> **JOIN\_CLAN\_USER\_IS\_NOT\_IN\_CLAN**: `1005`

User is not in a clan. Note: a `registerInTournament` response code
that shares this enum — never returned by `joinClan`.

***

### JOIN\_CLAN\_COOLDOWN\_ACTIVE

> **JOIN\_CLAN\_COOLDOWN\_ACTIVE**: `1006`

User is within the clan-switch cooldown window (switch only).

***

### JOIN\_CLAN\_JOINED\_AFTER\_TOURNAMENT\_START

> **JOIN\_CLAN\_JOINED\_AFTER\_TOURNAMENT\_START**: `1011`

Clan joined after tournament start. Note: a `registerInTournament`
response code that shares this enum — never returned by `joinClan`.
