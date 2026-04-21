# Interface: JackpotPublicMeta

## Properties

### name

> **name**: `string`

name of the jackpot

***

### description

> **description**: `string`

description/rules of the jackpot

***

### image\_url

> **image\_url**: `string`

image url of the jackpot

***

### winner\_template

> **winner\_template**: [`JackpotHtmlTemplate`](JackpotHtmlTemplate.md)

HTML template for the winner of the jackpt

***

### not\_winner\_template

> **not\_winner\_template**: [`JackpotHtmlTemplate`](JackpotHtmlTemplate.md)

HTML template for the not winner of the jackpot

***

### placeholder1

> **placeholder1**: `string`

custom value of placeholder1 defined by operator and can be used in the HTML templates

***

### placeholder2

> **placeholder2**: `string`

custom value of placeholder2 defined by operator and can be used in the HTML templates

***

### custom\_data

> **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - <https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes>
