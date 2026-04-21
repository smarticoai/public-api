# Interface: TUICustomSection

## Properties

### id

> **id**: `number`

The ID of the custom section

***

### body?

> `optional` **body?**: `string`

The body of the custom section

***

### menu\_img?

> `optional` **menu\_img?**: `string`

The image of the custom section, 64x64px

***

### menu\_name?

> `optional` **menu\_name?**: `string`

The name of the custom section

***

### custom\_skin\_images?

> `optional` **custom\_skin\_images?**: `string`

Custom images for custom section

***

### section\_type\_id?

> `optional` **section\_type\_id?**: [`AchCustomSectionType`](../enumerations/AchCustomSectionType.md)

The particular type of custom section, can be Missions, Tournaments, Lootbox and etc

***

### theme?

> `optional` **theme?**: [`AchCustomLayoutTheme`](../enumerations/AchCustomLayoutTheme.md)

Theme of the custom section

***

### generic\_custom\_css?

> `optional` **generic\_custom\_css?**: `string`

Custom css for the custom section

***

### mission\_tabs\_options?

> `optional` **mission\_tabs\_options?**: [`AchMissionsTabsOptions`](../enumerations/AchMissionsTabsOptions.md)

Tabs that can be shown in custom section, e.g Overview, No Overview, All tabs

***

### overview\_missions\_filter?

> `optional` **overview\_missions\_filter?**: [`AchOverviewMissionsFilter`](../enumerations/AchOverviewMissionsFilter.md)

Filter that allow to show missions by criteria

***

### overview\_missions\_count?

> `optional` **overview\_missions\_count?**: `number`

Quantity of missions to be shown in overview

***

### liquid\_entity\_data?

> `optional` **liquid\_entity\_data?**: [`LiquidEntityData`](../enumerations/LiquidEntityData.md)[]

Data to be used for Liquid templates

***

### ach\_tournament\_id?

> `optional` **ach\_tournament\_id?**: `number`

Tournament ID to be used for Liquid templates

***

### show\_raw\_data?

> `optional` **show\_raw\_data?**: `boolean`

Indicates if the data should be shown as raw data (for Liquid templates)

***

### liquid\_template?

> `optional` **liquid\_template?**: `number`

Liquid template id to be used for Liquid templates

***

### ach\_category\_ids?

> `optional` **ach\_category\_ids?**: `number`[]

List of IDs of the categories where the badge item is assigned, information about categories can be retrieved with getAchCategories method

***

### shop\_category\_ids?

> `optional` **shop\_category\_ids?**: `number`[]

List of IDs of the categories where the store item is assigned, information about categories can be retrieved with getShopCategories method

***

### raffle\_id?

> `optional` **raffle\_id?**: `number`

ID of the raffle to be used for Liquid templates
