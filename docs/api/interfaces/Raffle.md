# Interface: Raffle

## Properties

### raffle\_id

• **raffle\_id**: `number`

ID of the Raffle template

___

### public\_meta

• **public\_meta**: [`RafflePublicMeta`](RafflePublicMeta.md)

Meta information about raffle for the presentation on UI

___

### start\_date\_ts

• **start\_date\_ts**: `number`

Date of start

___

### end\_date\_ts

• **end\_date\_ts**: `number`

Date of end

___

### max\_tickets\_count

• **max\_tickets\_count**: `number`

Maximum numer of tickets that can be given to all users for the whole period of raffle

___

### current\_tickets\_count

• **current\_tickets\_count**: `number`

Number of tickets that are already given to all users for this raffle

___

### draws

• **draws**: [`RaffleDraw`](RaffleDraw.md)[]

List of draws that are available for this raffle.
For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022,
Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
