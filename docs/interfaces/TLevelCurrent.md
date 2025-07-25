# Interface: TLevelCurrent

TLevelCurrent describes the information of each level defined in the system along with ordinal position and progress of the current level

## Hierarchy

- [`TLevel`](TLevel.md)

  ↳ **`TLevelCurrent`**

## Properties

### id

• **id**: `number`

The ID of the Level

#### Inherited from

[TLevel](TLevel.md).[id](TLevel.md#id)

___

### name

• **name**: `string`

The name of the Level, translated to the user language

#### Inherited from

[TLevel](TLevel.md).[name](TLevel.md#name)

___

### description

• **description**: `string`

The description of the Level, translated to the user language

#### Inherited from

[TLevel](TLevel.md).[description](TLevel.md#description)

___

### image

• **image**: `string`

The URL of the image of the Level

#### Inherited from

[TLevel](TLevel.md).[image](TLevel.md#image)

___

### required\_points

• **required\_points**: `number`

The amount of points required to reach the Level

#### Inherited from

[TLevel](TLevel.md).[required_points](TLevel.md#required_points)

___

### visibility\_points

• **visibility\_points**: `number`

Number of points that user should collect in order to see this level

#### Inherited from

[TLevel](TLevel.md).[visibility_points](TLevel.md#visibility_points)

___

### required\_level\_counter\_1

• **required\_level\_counter\_1**: `number`

The counter of 1st metric used to reach the Level.
Relevant in case of using advanced leveling logic
https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users

#### Inherited from

[TLevel](TLevel.md).[required_level_counter_1](TLevel.md#required_level_counter_1)

___

### required\_level\_counter\_2

• **required\_level\_counter\_2**: `number`

The counter of 2nd metric used to reach the Level.
Relevant in case of using advanced leveling logic
https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users

#### Inherited from

[TLevel](TLevel.md).[required_level_counter_2](TLevel.md#required_level_counter_2)

___

### custom\_data

• **custom\_data**: `string`

Custom data as string or JSON string that can be used in API to build custom UI
You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice
Read more here - https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes

#### Inherited from

[TLevel](TLevel.md).[custom_data](TLevel.md#custom_data)

___

### ordinal\_position

• **ordinal\_position**: `number`

The ordinal position of the level

___

### progress

• **progress**: `number`

The progress of the level
