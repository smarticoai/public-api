# Interface: TMiniGameTemplate

TMiniGameTemplate describes the information of mini-games available for the user

## Properties

### id

> **id**: `number`

ID of the mini-game template

***

### name

> **name**: `string`

Name of the mini-game template, translated to the user language

***

### description

> **description**: `string`

Description of the mini-game template, translated to the user language

***

### thumbnail

> **thumbnail**: `string`

URL of the icon of the mini-game template, 256x256px

***

### visibile\_when\_can\_spin?

> `optional` **visibile\_when\_can\_spin?**: `boolean`

Indicates if the mini-game is visible when the user have attempts/points/gems/diamonds to play

***

### saw\_game\_type

> **saw\_game\_type**: [`SAWGameTypeName`](../enumerations/SAWGameTypeName.md)

The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc

***

### saw\_buyin\_type

> **saw\_buyin\_type**: [`SAWBuyInTypeName`](../enumerations/SAWBuyInTypeName.md)

How the user is charged for each game attempt e.g. Free, Points or Spin attempts

***

### buyin\_cost\_points?

> `optional` **buyin\_cost\_points?**: `number`

in case of charging type 'Points', what is the points amount will be deducted from user balance

***

### buyin\_cost\_gems?

> `optional` **buyin\_cost\_gems?**: `number`

in case of charging type 'Gems', what is the gems amount will be deducted from user balance

***

### buyin\_cost\_diamonds?

> `optional` **buyin\_cost\_diamonds?**: `number`

in case of charging type 'Diamonds', what is the diamonds amount will be deducted from user balance

***

### spin\_count?

> `optional` **spin\_count?**: `number`

in case of charging type 'Spin attempts', shows the current number of spin attempts that user has

***

### next\_available\_spin\_ts

> **next\_available\_spin\_ts**: `number`

if the game is limit to the number of spins that user can do during period of time,
this property shows the epoch time in UTC when the next attempt will be available.
Note that you need to enable 'Show time to the next available spin' setting on mini-game template in the backoffice
Important: this field will not be populated if “Max number of attempts a user can do” is set to value different from 1

***

### over\_limit\_message

> **over\_limit\_message**: `string`

The message that should be shown to the user when he cannot play the game, server rejected attempt with error code SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED

***

### no\_attempts\_message

> **no\_attempts\_message**: `string`

The message that should be shown to the user when he cannot play the game because he doesn't have spin attempts or points.

***

### jackpot\_current

> **jackpot\_current**: `number`

Current jackpont amount, if jackpot is enabled.

***

### jackpot\_add\_on\_attempt

> **jackpot\_add\_on\_attempt**: `number`

The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance.

***

### jackpot\_symbol

> **jackpot\_symbol**: `string`

The symbol of jackpot that is giving the sense to the 'amount' E.g. the symbol could be EUR and connected to the amount it can indicate that amount is monetary, e.g. '100 EUR'. Or the symbol can be 'Free spins' and connected to the amount it can indicate that amount is number of free spins, e.g. '100 Free spins'.

***

### promo\_image

> **promo\_image**: `string`

The promo image, 500x240px

***

### promo\_text

> **promo\_text**: `string`

The promo text

***

### custom\_data

> **custom\_data**: `any`

The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number

***

### prizes

> **prizes**: [`TMiniGamePrize`](TMiniGamePrize.md)[]

List of prizes for mini-games

***

### expose\_game\_stat\_on\_api?

> `optional` **expose\_game\_stat\_on\_api?**: `boolean`

When enabled, the number of items in the pool and number of won items will be exposed in the Retention API and in the UI Widgets

***

### relative\_period\_timezone?

> `optional` **relative\_period\_timezone?**: `number`

Time zone to ensure each day aligns with your local midnight.

***

### activeFromDate?

> `optional` **activeFromDate?**: `number`

Holds time from which template will become available, for the template that are targeted to be available from specific time (UNIX timestamp)

***

### activeTillDate?

> `optional` **activeTillDate?**: `number`

Holds time till which template will become available, for the templates that are targeted to be available from specific time (UNIX timestamp)

***

### steps\_to\_finish\_game?

> `optional` **steps\_to\_finish\_game?**: `number`

The amount of steps to complete the game and gather the prize

***

### custom\_section\_id?

> `optional` **custom\_section\_id?**: `number`

Hold the id of the custom section

***

### saw\_template\_ui\_definition

> **saw\_template\_ui\_definition**: [`SAWTemplateUI`](SAWTemplateUI.md)

The UI definition of the mini-game

***

### game\_layout?

> `optional` **game\_layout?**: [`SAWGameLayoutName`](../enumerations/SAWGameLayoutName.md)

The layout of the game

***

### show\_prize\_history?

> `optional` **show\_prize\_history?**: `boolean`

When enabled the prize history icon is visible on a certain template

***

### max\_number\_of\_attempts?

> `optional` **max\_number\_of\_attempts?**: `number`

The maximum number of attempts that user can do during period of time

***

### max\_spins\_period\_ms?

> `optional` **max\_spins\_period\_ms?**: `number`

The period of time in milliseconds during which the user can do the maximum number of attempts

***

### expose\_user\_spin\_id?

> `optional` **expose\_user\_spin\_id?**: [`SAWExposeUserSpinIdName`](../enumerations/SAWExposeUserSpinIdName.md)

The ID of the user spin id to expose on the game
