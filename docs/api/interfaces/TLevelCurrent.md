# Interface: TLevelCurrent

TLevelCurrent extends `TLevel` with the user's progress toward the next level.
Returned by `_smartico.api.getCurrentLevel()`.

## Extends

- [`TLevel`](TLevel.md)

## Properties

### id

> **id**: `number`

Stable ID of the level.

#### Inherited from

[`TLevel`](TLevel.md).[`id`](TLevel.md#id)

***

### name

> **name**: `string`

Display name of the level, pre-translated to the user's language.

#### Inherited from

[`TLevel`](TLevel.md).[`name`](TLevel.md#name)

***

### description

> **description**: `string`

Display description of the level, pre-translated to the user's language.

#### Inherited from

[`TLevel`](TLevel.md).[`description`](TLevel.md#description)

***

### image

> **image**: `string`

URL of the level image (256x256 px source).

#### Inherited from

[`TLevel`](TLevel.md).[`image`](TLevel.md#image)

***

### required\_points

> **required\_points**: `number`

Total `ach_points_ever` required to reach this level.

#### Inherited from

[`TLevel`](TLevel.md).[`required_points`](TLevel.md#required_points)

***

### visibility\_points

> **visibility\_points**: `number`

Visibility threshold — clients hide the level from the user until
`ach_points_ever >= visibility_points`. `null` means always visible.

#### Inherited from

[`TLevel`](TLevel.md).[`visibility_points`](TLevel.md#visibility_points)

***

### required\_level\_counter\_1

> **required\_level\_counter\_1**: `number`

Required value of the first level counter for sliding-window leveling.
`null` on points-only labels. See `UserLevelExtraCountersT`.

#### Inherited from

[`TLevel`](TLevel.md).[`required_level_counter_1`](TLevel.md#required_level_counter_1)

***

### required\_level\_counter\_2

> **required\_level\_counter\_2**: `number`

Required value of the second level counter for sliding-window leveling.
`null` on points-only labels.

#### Inherited from

[`TLevel`](TLevel.md).[`required_level_counter_2`](TLevel.md#required_level_counter_2)

***

### custom\_data

> **custom\_data**: `string`

Operator-defined custom data. The SDK auto-parses JSON-looking
strings, so at runtime this is `any` despite the `string` type.

#### Inherited from

[`TLevel`](TLevel.md).[`custom_data`](TLevel.md#custom_data)

***

### ordinal\_position

> **ordinal\_position**: `number`

1-based position in the ladder (matches the order of the returned
array, which is sorted by `required_points` ASC).

#### Inherited from

[`TLevel`](TLevel.md).[`ordinal_position`](TLevel.md#ordinal_position)

***

### progress

> **progress**: `number`

Progress to the next level as a 0–100 integer percentage. `100`
at the highest level.
