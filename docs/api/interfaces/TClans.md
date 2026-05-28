# Interface: TClans

TClans describes the clans payload returned by the API.

## Properties

### clans

> **clans**: [`TClan`](TClan.md)[]

List of active clans available to the user

***

### user\_clan\_id

> **user\_clan\_id**: `number`

The clan ID the current user belongs to; null if clanless

***

### cooldown\_until

> **cooldown\_until**: `string`

Switch-cooldown expiry as ISO 8601 UTC string ("YYYY-MM-DDTHH:MM:SS"
with no timezone suffix; interpret as UTC). `null` when no cooldown.
User-level: while set, the user cannot join any clan.

***

### join\_date

> **join\_date**: `number`

Epoch ms when the current user joined their clan; null if clanless
