# Interface: RaffleWonPrize

A single prize the user won within the raffle.

## Properties

### raf\_won\_id

> **raf\_won\_id**: `number`

Unique ID of the winning row (pass to `claimRafflePrize` when `requires_claim` is `true`).

***

### prize\_id

> **prize\_id**: `number`

ID of the prize definition.

***

### raffle\_run\_id

> **raffle\_run\_id**: `number`

Run-instance ID of the draw that awarded this prize.

***

### draw\_id

> **draw\_id**: `number`

Schedule ID of the draw that awarded this prize.

***

### public\_meta

> **public\_meta**: [`RaffleWonPrizePublicMeta`](RaffleWonPrizePublicMeta.md)

Presentation meta (name / image).

***

### requires\_claim

> **requires\_claim**: `boolean`

Whether this prize requires a claim action from the user.

***

### claimed\_date

> **claimed\_date**: `number`

Epoch ms when the prize was claimed; `null` when not yet claimed.
