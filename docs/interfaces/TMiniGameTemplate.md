# Interface: TMiniGameTemplate

TMiniGameTemplate describes the information of mini-games available for the user

## Properties

### id

• **id**: `number`

ID of the mini-game template

___

### name

• **name**: `string`

Name of the mini-game template, translated to the user language

___

### description

• **description**: `string`

Description of the mini-game template, translated to the user language

___

### thumbnail

• **thumbnail**: `string`

URL of the icon of the mini-game template

___

### saw\_game\_type

• **saw\_game\_type**: [`SAWGameTypeName`](../enums/SAWGameTypeName.md)

The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc

___

### saw\_buyin\_type

• **saw\_buyin\_type**: [`SAWBuyInTypeName`](../enums/SAWBuyInTypeName.md)

How the user is charged for each game attempt e.g. Free, Points or Spin attempts

___

### buyin\_cost\_points

• **buyin\_cost\_points**: `number`

in case of charging type 'Points', what is the points amount will be deducted from user balance

___

### spin\_count

• `Optional` **spin\_count**: `number`

in case of charging type 'Spin attempts', shows the current number of spin attempts that user has

___

### next\_available\_spin\_ts

• **next\_available\_spin\_ts**: `number`

if the game is limit to the number of spins that user can do during period of time, this property shows the epoch time in UTC when the next attempt will be available

___

### over\_limit\_message

• **over\_limit\_message**: `string`

The message that should be shown to the user when he cannot play the game, server rejected attempt with error code SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED

___

### no\_attempts\_message

• **no\_attempts\_message**: `string`

The message that should be shown to the user when he cannot play the game because he doesn't have spin attempts or points.

___

### jackpot\_current

• **jackpot\_current**: `number`

Current jackpont amount, if jackpot is enabled.

___

### jackpot\_add\_on\_attempt

• **jackpot\_add\_on\_attempt**: `number`

The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance.

___

### jackpot\_symbol

• **jackpot\_symbol**: `string`

The symbol of jackpot that is giving the sense to the 'amount' E.g. the symbol could be EUR and connected to the amount it can indicate that amount is monetary, e.g. '100 EUR'. Or the symbol can be 'Free spins' and connected to the amount it can indicate that amount is number of free spins, e.g. '100 Free spins'.

___

### promo\_image

• **promo\_image**: `string`

The promo image

___

### promo\_text

• **promo\_text**: `string`

The promo text

___

### custom\_data

• **custom\_data**: `any`

The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number

___

### prizes

• **prizes**: [`TMiniGamePrize`](TMiniGamePrize.md)[]

List of prizes for mini-games

___

### expose\_game\_stat\_on\_api

• `Optional` **expose\_game\_stat\_on\_api**: `boolean`

When enabled, the number of items in the pool and number of won items will be exposed in the Retention API and in the UI Widgets

___

### relative\_period\_timezone

• `Optional` **relative\_period\_timezone**: `number`

Time zone to ensure each day aligns with your local midnight.

___

### activeFromDate

• `Optional` **activeFromDate**: `number`

Holds time from which template will become available, for the template that are targeted to be available from specific time (UNIX timestamp)

___

### activeTillDate

• `Optional` **activeTillDate**: `number`

Holds time till which template will become available, for the templates that are targeted to be available from specific time (UNIX timestamp)

___

### steps\_to\_finish\_game

• `Optional` **steps\_to\_finish\_game**: `number`

The amount of steps to complete the game and gather the prize

___
