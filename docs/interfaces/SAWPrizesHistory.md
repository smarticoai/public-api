# Interface: SAWPrizesHistory

Mini-game (SAW) prize history entry (raw, non-transformed).

## Properties

### template

• **template**: [`SAWTemplate`](SAWTemplate.md)

The mini-game template information

___

### saw\_template\_id

• **saw\_template\_id**: `number`

ID of the mini-game template

___

### saw\_prize\_id

• **saw\_prize\_id**: `number`

ID of the prize that user won

___

### prize\_amount

• **prize\_amount**: `number`

Amount of the prize

___

### client\_request\_id

• **client\_request\_id**: `string`

Client request ID for the spin

___

### is\_claimed

• **is\_claimed**: `boolean`

Whether the prize has been claimed/acknowledged

___

### create\_date\_ts

• **create\_date\_ts**: `number`

Timestamp when the prize was won

___

### acknowledge\_date\_ts

• **acknowledge\_date\_ts**: `number`

Timestamp when the prize was acknowledged
