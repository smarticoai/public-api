# Interface: TRafflePrizeWinner

## Properties

### id

• **id**: `number`

Id of the winner definition, for the repetative winners (e.g. same winner won two prizes), this number will be the same for all winner that are repeating
(internal name: schedule_id)

___

### username

• `Optional` **username**: `string`

Winner user name

___

### avatar\_url

• `Optional` **avatar\_url**: `string`

URL of the image of user avatar

___

### ticket

• **ticket**: [`TRaffleTicket`](TRaffleTicket.md)

Ticket information (number string and integer)

___

### raf\_won\_id

• **raf\_won\_id**: `number`

Unique ID of winning

___

### claimed\_date

• **claimed\_date**: `number`

Date when the prize was claimed
