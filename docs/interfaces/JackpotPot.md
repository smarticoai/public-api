# Interface: JackpotPot

## Properties

### jp\_template\_id

• **jp\_template\_id**: `number`

ID of the jackpot template

___

### jp\_pot\_id

• **jp\_pot\_id**: `number`

ID of the jackpot pot

___

### current\_pot\_amount

• **current\_pot\_amount**: `number`

currency of the jackpot pot in the Jackput base currency

___

### current\_pot\_amount\_user\_currency

• **current\_pot\_amount\_user\_currency**: `number`

currency of the jackpot pot in the user wallet currency

___

### explode\_date\_ts

• **explode\_date\_ts**: `number`

the date/time when this pot exploded

___

### current\_pot\_temperature

• **current\_pot\_temperature**: `JackPotTemparature`

current pot temperature
0 - cold. seed amount < current pot < (min amount - seed amount)/2
1 - warm. (min amount - seed amount)/2 < current pot < min amount
2 - hot.  current pot > min amount
