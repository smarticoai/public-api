# Enumeration: JoinClanErrorCode

## Enumeration Members

### JOIN\_CLAN\_OK

> **JOIN\_CLAN\_OK**: `0`

No error, join completed

***

### JOIN\_CLAN\_INVALID\_PARAMETERS

> **JOIN\_CLAN\_INVALID\_PARAMETERS**: `1000`

Invalid parameters

***

### JOIN\_CLAN\_NOT\_FOUND

> **JOIN\_CLAN\_NOT\_FOUND**: `1001`

clan_id doesn't exist for this label

***

### JOIN\_CLAN\_FULL

> **JOIN\_CLAN\_FULL**: `1002`

members_count >= capacity_limit

***

### JOIN\_CLAN\_INSUFFICIENT\_FUNDS

> **JOIN\_CLAN\_INSUFFICIENT\_FUNDS**: `1003`

Not enough Points / Gems / Diamonds for entry fee

***

### JOIN\_CLAN\_SEGMENT\_MISMATCH

> **JOIN\_CLAN\_SEGMENT\_MISMATCH**: `1004`

User doesn't satisfy entry_conditions / entry_segment_id

***

### JOIN\_CLAN\_USER\_IS\_NOT\_IN\_CLAN

> **JOIN\_CLAN\_USER\_IS\_NOT\_IN\_CLAN**: `1005`

User is not in a clan

***

### JOIN\_CLAN\_COOLDOWN\_ACTIVE

> **JOIN\_CLAN\_COOLDOWN\_ACTIVE**: `1006`

User is within the CLAN_COOLDOWN_DAYS window

***

### JOIN\_CLAN\_ARCHIVED

> **JOIN\_CLAN\_ARCHIVED**: `1007`

clan_status_id != 1 (clan is archived)

***

### JOIN\_CLAN\_JOINED\_AFTER\_TOURNAMENT\_START

> **JOIN\_CLAN\_JOINED\_AFTER\_TOURNAMENT\_START**: `1011`

Clan joined after tournament start
