# Interface: TRafflePrizeWinner

## Properties

### id

> **id**: `number`

Id of the winner definition, for the repetative winners (e.g. same winner won two prizes), this number will be the same for all winner that are repeating
(internal name: schedule_id)

***

### username?

> `optional` **username?**: `string`

Winner user name

***

### avatar\_url?

> `optional` **avatar\_url?**: `string`

URL of the image of user avatar

***

### ticket

> **ticket**: [`TRaffleTicket`](TRaffleTicket.md)

Ticket information (number string and integer)

***

### raf\_won\_id

> **raf\_won\_id**: `number`

Unique ID of winning

***

### claimed\_date

> **claimed\_date**: `number`

Date when the prize was claimed
