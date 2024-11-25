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

___

### acknowledge\_type

• **acknowledge\_type**: `SAWAcknowledgeTypeName`

___

### aknowledge\_message

• **aknowledge\_message**: `string`

___

### acknowledge\_dp

• **acknowledge\_dp**: `string`

___

### acknowledge\_action\_title

• **acknowledge\_action\_title**: `string`

___

### acknowledge\_dp\_additional

• `Optional` **acknowledge\_dp\_additional**: `string`

___

### acknowledge\_action\_title\_additional

• `Optional` **acknowledge\_action\_title\_additional**: `string`

___

### pool

• `Optional` **pool**: `number`

___

### pool\_initial

• `Optional` **pool\_initial**: `number`

___

### wins\_count

• `Optional` **wins\_count**: `number`

___

### weekdays

• `Optional` **weekdays**: `number`[]

___

### active\_from\_ts

• `Optional` **active\_from\_ts**: `number`

___

### active\_till\_ts

• `Optional` **active\_till\_ts**: `number`

___

### relative\_period\_timezone

• `Optional` **relative\_period\_timezone**: `number`

___

### out\_of\_stock\_message

• `Optional` **out\_of\_stock\_message**: `string`

Message when the prize pool is empty for that specific prize

___

### is\_surcharge

• `Optional` **is\_surcharge**: `boolean`

Flag indicating that the prize is surcharged (available all the time, despite pool numbers)