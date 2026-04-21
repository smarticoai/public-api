# Interface: TLevel

TLevel describes the information of each level defined in the system
There is no order of the levels, but it can be calculated using required_points property
The current level of user can be taken from the user object using ach_level_current_id property
The progress to the next level can be calculated using ach_points_ever and required_points properties of next level

## Extended by

- [`TLevelCurrent`](TLevelCurrent.md)

## Properties

### id

> **id**: `number`

The ID of the Level

***

### name

> **name**: `string`

The name of the Level, translated to the user language

***

### description

> **description**: `string`

The description of the Level, translated to the user language

***

### image

> **image**: `string`

The URL of the image of the Level, 256x256px

***

### required\_points

> **required\_points**: `number`

The amount of points required to reach the Level

***

### visibility\_points

> **visibility\_points**: `number`

Number of points that user should collect in order to see this level

***

### required\_level\_counter\_1

> **required\_level\_counter\_1**: `number`

The counter of 1st metric used to reach the Level.
Relevant in case of using advanced leveling logic
https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users

***

### required\_level\_counter\_2

> **required\_level\_counter\_2**: `number`

The counter of 2nd metric used to reach the Level.
Relevant in case of using advanced leveling logic
https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users

***

### custom\_data

> **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes

***

### ordinal\_position

> **ordinal\_position**: `number`

The ordinal position of the level
