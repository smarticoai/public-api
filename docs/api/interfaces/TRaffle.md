# Interface: TRaffle

## Properties

### id

• **id**: `number`

ID of the Raffle template

___

### name

• **name**: `string`

Name of the raffle

___

### description

• **description**: `string`

Description of the raffle

___

### custom\_section\_id

• **custom\_section\_id**: `number`

ID of the custom section that is linked to the raffle in the Gamification widget

___

### image\_url

• **image\_url**: `string`

URL of the image that represents the raffle

___

### image\_url\_mobile

• **image\_url\_mobile**: `string`

URL of the mobile image that represents the raffle

___

### custom\_data

• **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes

___

### start\_date

• **start\_date**: `number`

Date of start

___

### end\_date

• **end\_date**: `number`

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

• **draws**: [`TRaffleDraw`](TRaffleDraw.md)[]

List of draws that are available for this raffle.
For example, if the raffle is containg one hourly draw, one daily draw and one draw on fixed date like 01/01/2022,
Then the list will always return 3 draws, no matter if the draws are already executed or they are in the future.
