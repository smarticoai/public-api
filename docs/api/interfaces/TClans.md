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

Cooldown-until date string; null if no cooldown
