# Interface: TLevel

TLevel describes one level in the label's level ladder.
Returned by `_smartico.api.getLevels()` (already sorted by `required_points` ASC).

## Extended by

- [`TLevelCurrent`](TLevelCurrent.md)

## Properties

### id

> **id**: `number`

Stable ID of the level.

***

### name

> **name**: `string`

Display name of the level, pre-translated to the user's language.

***

### description

> **description**: `string`

Display description of the level, pre-translated to the user's language.

***

### image

> **image**: `string`

URL of the level image (256x256 px source).

***

### required\_points

> **required\_points**: `number`

Total `ach_points_ever` required to reach this level.

***

### visibility\_points

> **visibility\_points**: `number`

Visibility threshold — clients hide the level from the user until
`ach_points_ever >= visibility_points`. `null` means always visible.

***

### required\_level\_counter\_1

> **required\_level\_counter\_1**: `number`

Required value of the first level counter for sliding-window leveling.
`null` on points-only labels. See `UserLevelExtraCountersT`.

***

### required\_level\_counter\_2

> **required\_level\_counter\_2**: `number`

Required value of the second level counter for sliding-window leveling.
`null` on points-only labels.

***

### custom\_data

> **custom\_data**: `string`

Operator-defined custom data. The SDK auto-parses JSON-looking
strings, so at runtime this is `any` despite the `string` type.

***

### ordinal\_position

> **ordinal\_position**: `number`

1-based position in the ladder (matches the order of the returned
array, which is sorted by `required_points` ASC).
