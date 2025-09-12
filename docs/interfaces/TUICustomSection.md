# Interface: TUICustomSection

## Properties

### id

• **id**: `number`

The ID of the custom section

___

### body

• `Optional` **body**: `string`

The body of the custom section

___

### menu\_img

• `Optional` **menu\_img**: `string`

The image of the custom section

___

### menu\_name

• `Optional` **menu\_name**: `string`

The name of the custom section

___

### custom\_skin\_images

• `Optional` **custom\_skin\_images**: `string`

Custom images for custom section

___

### section\_type\_id

• `Optional` **section\_type\_id**: [`AchCustomSectionType`](../enums/AchCustomSectionType.md)

The particular type of custom section, can be Missions, Tournaments, Lootbox and etc

___

### theme

• `Optional` **theme**: [`AchCustomLayoutTheme`](../enums/AchCustomLayoutTheme.md)

Theme of the custom section

___

### generic\_custom\_css

• `Optional` **generic\_custom\_css**: `string`

Custom css for the custom section

___

### mission\_tabs\_options

• `Optional` **mission\_tabs\_options**: [`AchMissionsTabsOptions`](../enums/AchMissionsTabsOptions.md)

Tabs that can be shown in custom section, e.g Overview, No Overview, All tabs

___

### overview\_missions\_filter

• `Optional` **overview\_missions\_filter**: [`AchOverviewMissionsFilter`](../enums/AchOverviewMissionsFilter.md)

Filter that allow to show missions by criteria

___

### overview\_missions\_count

• `Optional` **overview\_missions\_count**: `number`

Quantity of missions to be shown in overview

___

### liquid\_entity\_data

• `Optional` **liquid\_entity\_data**: [`LiquidEntityData`](../enums/LiquidEntityData.md)[]

Data to be used for Liquid templates

___

### ach\_tournament\_id

• `Optional` **ach\_tournament\_id**: `number`

Tournament ID to be used for Liquid templates

___

### show\_raw\_data

• `Optional` **show\_raw\_data**: `boolean`

Indicates if the data should be shown as raw data (for Liquid templates)

___

### liquid\_template

• `Optional` **liquid\_template**: `number`

Liquid template id to be used for Liquid templates
