# Interface: TMiniGamePrize

TMiniGamePrize describes the information of prize in the array of prizes in the TMiniGameTemplate

## Properties

### id

• **id**: `number`

ID of the prize

___

### name

• **name**: `string`

The visual name of the prize

___

### prize\_type

• **prize\_type**: [`MiniGamePrizeTypeName`](../enums/MiniGamePrizeTypeName.md)

The type of the prize,  no-prize, points, bonus, manual, spin, jackpot

___

### prize\_value

• `Optional` **prize\_value**: `number`

Numeric value of the prize in case it's pints or spin type

___

### font\_size

• `Optional` **font\_size**: `number`

Custom font size for the prize (desktop)

___

### font\_size\_mobile

• `Optional` **font\_size\_mobile**: `number`

Custom font size for the prize (mobile)

___

### icon

• `Optional` **icon**: `string`

The URL of the icon of the prize

___

### position

• **position**: `number`

for scratch card defines position of prize in the list

___

### acknowledge\_type

• **acknowledge\_type**: `SAWAcknowledgeTypeName`

Type of acknowledge message for users

___

### aknowledge\_message

• **aknowledge\_message**: `string`

Message that will be shown to user in modal pop-up

___

### acknowledge\_dp

• **acknowledge\_dp**: `string`

Deep link that will trigger some action in modal pop-up

___

### acknowledge\_action\_title

• **acknowledge\_action\_title**: `string`

The name of the action button in modal pop-up

___

### acknowledge\_dp\_additional

• `Optional` **acknowledge\_dp\_additional**: `string`

Deep link that will trigger some action in modal pop-up (additional)

___

### acknowledge\_action\_title\_additional

• `Optional` **acknowledge\_action\_title\_additional**: `string`

The name of the action button in modal pop-up (additional)

___

### out\_of\_stock\_message

• `Optional` **out\_of\_stock\_message**: `string`

Message when the prize pool is empty for that specific prize

___

### pool

• `Optional` **pool**: `number`

Number of items in stock

___

### pool\_initial

• `Optional` **pool\_initial**: `number`

Initial number of items in stock

___

### wins\_count

• `Optional` **wins\_count**: `number`

Number of wins in game

___

### weekdays

• `Optional` **weekdays**: `number`[]

Number of days of week, when the prize can be available

___

### active\_from\_ts

• `Optional` **active\_from\_ts**: `number`

Holds time from which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)

___

### active\_till\_ts

• `Optional` **active\_till\_ts**: `number`

Holds time till which prize will become available, for the prizes that are targeted to be available from specific time (UNIX timestamp)

___

### relative\_period\_timezone

• `Optional` **relative\_period\_timezone**: `number`

Time zone to ensure each day aligns with your local midnight.

___

### is\_surcharge

• `Optional` **is\_surcharge**: `boolean`

Flag indicating that the prize is surcharged (available all the time, despite pool numbers)

___

### is\_deleted

• `Optional` **is\_deleted**: `boolean`

Flag indicating the state of the prize

___

### custom\_data

• `Optional` **custom\_data**: `any`

The custom data of the mini-game defined by operator in the BackOffice. Can be a JSON object, string or number

___

### prize\_modifiers

• `Optional` **prize\_modifiers**: `PrizeModifiers`[]

Prize modifiers that will multiply by 2x, 5x or 10x the current total. This will not affect the final Prize Amount that will be awarded.

___

### allow\_split\_decimal

• `Optional` **allow\_split\_decimal**: `boolean`

When enabled, you can split prize value by decimal values

___

### hide\_prize\_from\_history

• `Optional` **hide\_prize\_from\_history**: `boolean`

When enabled, you can hide prize from prize history
