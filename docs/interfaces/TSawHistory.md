# Interface: TSawHistory

## Properties

### template

• **template**: `SAWTemplate`

The initial information about mini-game

___

### saw\_template\_id

• **saw\_template\_id**: `number`

ID of the mini-game template

___

### saw\_prize\_id

• **saw\_prize\_id**: `number`

The saw_prize_id that user won, details of the prize can be found in the mini-game definition

___

### prize\_amount

• **prize\_amount**: `number`

Amount of prizes in stock

___

### client\_request\_id

• **client\_request\_id**: `string`

Request ID that client is sending to show history

___

### is\_claimed

• **is\_claimed**: `boolean`

Flag indicating to show whether prize in the mini-game claimed or not

___

### create\_date\_ts

• **create\_date\_ts**: `number`

Win prize date in milliseconds

___

### acknowledge\_date\_ts

• **acknowledge\_date\_ts**: `number`

Claim prize date in milliseconds