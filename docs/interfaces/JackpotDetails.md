# Interface: JackpotDetails

JackpotDetails the information about Jackpot template
It also includes JackpotPot object that holds the current value of the jackpot
Flag is_opted_in indicates if the current user is opted in to the jackpot

## Properties

### jp\_template\_id

• **jp\_template\_id**: `number`

ID of the jackpot template

___

### jp\_type\_id

• **jp\_type\_id**: [`Main`](../enums/JackpotType.md#main)

type of jackpot logic

___

### jp\_public\_meta

• **jp\_public\_meta**: [`JackpotPublicMeta`](JackpotPublicMeta.md)

UI information of jackpot, like name, description, etc.

___

### jp\_currency

• **jp\_currency**: `string`

base currency of the jackpot

___

### user\_currency

• **user\_currency**: `string`

wallet currency of currently logged in user

___

### related\_games

• `Optional` **related\_games**: [`AchRelatedGame`](AchRelatedGame.md)[]

list of related games that are eligible for the jackpot

___

### contribution\_type

• **contribution\_type**: [`JackpotContributionType`](../enums/JackpotContributionType.md)

type of the user contribution to the jackpot

___

### contribution\_value

• **contribution\_value**: `number`

value of the user contribution. Fixed amount or percentage of bet depending on the contribution type

___

### pot

• **pot**: [`JackpotPot`](JackpotPot.md)

information of current value of the jackpot

___

### is\_opted\_in

• **is\_opted\_in**: `boolean`

indication if the current user is opted in to the jackpot

___

### ach\_related\_game\_allow\_all

• **ach\_related\_game\_allow\_all**: `boolean`

indicates whether all games are eligible for the jackpot
