# Interface: TSawHistory

TSawHistory describes the information of the history of mini-games.

## Properties

### template

• **template**: `SAWTemplate`

The initial information about mini-game.

___

### saw_template_id

• **saw_template_id**: `number`

ID of the mini-game template.

___

### saw_prize_id

• **saw_prize_id**: `number`

The saw_prize_id that user won, details of the prize can be found in the mini-game definition.

___

### prize_amount

• **prize_amount**: `number`

Amount of prizes in stock.

___

### client_request_id

• **client_request_id**: `string`

Request ID that client is sending to show history.

___

### is_claimed

• **is_claimed**: `boolean`

Flag indicating to show whether prize in the mini-game claimed or not.

___