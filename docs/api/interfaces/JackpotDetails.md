# Interface: JackpotDetails

JackpotDetails the information about Jackpot template
It also includes JackpotPot object that holds the current value of the jackpot
Flag is_opted_in indicates if the current user is opted in to the jackpot

## Properties

### jp\_template\_id

> **jp\_template\_id**: `number`

ID of the jackpot template

***

### jp\_type\_id

> **jp\_type\_id**: [`JackpotType`](../enumerations/JackpotType.md)

Type of jackpot logic

***

### jp\_public\_meta

> **jp\_public\_meta**: [`JackpotPublicMeta`](JackpotPublicMeta.md)

UI information of jackpot, like name, description, etc.

***

### jp\_currency

> **jp\_currency**: `string`

Base currency of the jackpot

***

### user\_currency

> **user\_currency**: `string`

Wallet currency of currently logged in user

***

### contribution\_type

> **contribution\_type**: [`JackpotContributionType`](../enumerations/JackpotContributionType.md)

Type of the user contribution to the jackpot

***

### contribution\_value

> **contribution\_value**: `number`

Value of the user contribution. Fixed amount or percentage of bet depending on the contribution type

***

### pot

> **pot**: [`JackpotPot`](JackpotPot.md)

Information of current value of the jackpot

***

### is\_opted\_in

> **is\_opted\_in**: `boolean`

Indication if the current user is opted in to the jackpot

***

### ach\_related\_game\_allow\_all

> **ach\_related\_game\_allow\_all**: `boolean`

Indicates whether all games are eligible for the jackpot

***

### registration\_count

> **registration\_count**: `number`

The number of users who have opted in to participate in the jackpot

***

### expose\_winners\_over\_api

> **expose\_winners\_over\_api**: `boolean`

Show winners in widget and over API
