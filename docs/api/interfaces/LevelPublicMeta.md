# Interface: LevelPublicMeta

## Properties

### description?

> `optional` **description?**: `string`

Description of level, HTML capabable

***

### image\_url?

> `optional` **image\_url?**: `string`

URL to the image of level

***

### name?

> `optional` **name?**: `string`

Name of level

***

### visibility\_points?

> `optional` **visibility\_points?**: `number`

Number of points that user should have collected in order to see this level

***

### position?

> `optional` **position?**: `object`

X & Y coordinates of level on the visual mission map, for desktop and mobile

#### mx

> **mx**: `number`

#### my

> **my**: `number`

#### dx

> **dx**: `number`

#### dy

> **dy**: `number`

***

### custom\_data?

> `optional` **custom\_data?**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
