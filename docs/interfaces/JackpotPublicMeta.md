# Interface: JackpotPublicMeta

## Properties

### name

• **name**: `string`

name of the jackpot

___

### description

• **description**: `string`

description/rules of the jackpot

___

### image\_url

• **image\_url**: `string`

image url of the jackpot

___

### winner\_template

• **winner\_template**: [`JackpotHtmlTemplate`](JackpotHtmlTemplate.md)

HTML template for the winner of the jackpt

___

### not\_winner\_template

• **not\_winner\_template**: [`JackpotHtmlTemplate`](JackpotHtmlTemplate.md)

HTML template for the not winner of the jackpot

___

### placeholder1

• **placeholder1**: `string`

custom value of placeholder1 defined by operator and can be used in the HTML templates

___

### placeholder2

• **placeholder2**: `string`

custom value of placeholder2 defined by operator and can be used in the HTML templates

___

### custom\_data

• **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - <https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes>
