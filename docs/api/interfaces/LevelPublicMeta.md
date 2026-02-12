# Interface: LevelPublicMeta

## Properties

### description

• `Optional` **description**: `string`

Description of level, HTML capabable

___

### image\_url

• `Optional` **image\_url**: `string`

URL to the image of level

___

### name

• `Optional` **name**: `string`

Name of level

___

### visibility\_points

• `Optional` **visibility\_points**: `number`

Number of points that user should have collected in order to see this level

___

### position

• `Optional` **position**: `Object`

X & Y coordinates of level on the visual mission map, for desktop and mobile

#### Type declaration

| Name | Type |
| :------ | :------ |
| `mx` | `number` |
| `my` | `number` |
| `dx` | `number` |
| `dy` | `number` |

___

### custom\_data

• `Optional` **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
