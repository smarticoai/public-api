# Interface: RafflePublicMeta

## Properties

### name

> **name**: `string`

Name of the raffle

***

### description

> **description**: `string`

Description of the raffle

***

### custom\_section\_id

> **custom\_section\_id**: `number`

ID of the custom section that is linked to the raffle in the Gamification widget

***

### image\_url

> **image\_url**: `string`

URL of the image that represents the raffle

***

### image\_url\_mobile

> **image\_url\_mobile**: `string`

URL of the mobile image that represents the raffle

***

### hint\_text

> **hint\_text**: `string`

Text for Terms and Conditions

***

### custom\_data

> **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - <https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes>

***

### ticket\_cap\_visualization?

> `optional` **ticket\_cap\_visualization?**: [`RaffleTicketCapVisualization`](../enumerations/RaffleTicketCapVisualization.md)

- Value 1 (Counter): Shows a real-time "Tickets Remaining" display available during the whole Raffle activity.
- Value 2 (Message): Will show a specific message that triggers only when the cap is reached and inform users that tickets will be no longer be issued.
