# Interface: TUICustomSection

One operator-configured navigation entry. Returned by `getCustomSections()`.
`section_type_id` is the dispatch key — it determines which page component the
consumer mounts when the user opens this section.

## Properties

### id

> **id**: `number`

Stable numeric ID of the section.

***

### body?

> `optional` **body?**: `string`

Raw HTML body for `HTML_PAGE` sections; Liquid template body for `LEVELS` (Liquid) sections.

***

### menu\_img?

> `optional` **menu\_img?**: `string`

CDN URL of the section's nav icon, 64x64 px square.

***

### menu\_name?

> `optional` **menu\_name?**: `string`

Display name shown next to the nav icon. Pre-translated server-side.

***

### custom\_skin\_images?

> `optional` **custom\_skin\_images?**: `string`

JSON-serialized list of skin image overrides for themed sections (e.g. `MISSION_CUSTOM_LAYOUT`).

***

### section\_type\_id?

> `optional` **section\_type\_id?**: [`AchCustomSectionType`](../enumerations/AchCustomSectionType.md)

Dispatch key — see [AchCustomSectionType](../enumerations/AchCustomSectionType.md).

***

### theme?

> `optional` **theme?**: [`AchCustomLayoutTheme`](../enumerations/AchCustomLayoutTheme.md)

Themed-layout name for `MISSION_CUSTOM_LAYOUT` sections; see [AchCustomLayoutTheme](../enumerations/AchCustomLayoutTheme.md).

***

### generic\_custom\_css?

> `optional` **generic\_custom\_css?**: `string`

Custom CSS for themed layouts.

***

### mission\_tabs\_options?

> `optional` **mission\_tabs\_options?**: [`AchMissionsTabsOptions`](../enumerations/AchMissionsTabsOptions.md)

Which tabs to render for `MISSIONS_CATEGORY` sections; see [AchMissionsTabsOptions](../enumerations/AchMissionsTabsOptions.md).

***

### overview\_missions\_filter?

> `optional` **overview\_missions\_filter?**: [`AchOverviewMissionsFilter`](../enumerations/AchOverviewMissionsFilter.md)

Mission-filter rule for the Overview tab; see [AchOverviewMissionsFilter](../enumerations/AchOverviewMissionsFilter.md).

***

### overview\_missions\_count?

> `optional` **overview\_missions\_count?**: `number`

Maximum number of missions shown in the Overview tab.

***

### url\_or\_dp?

> `optional` **url\_or\_dp?**: `string`

Click target for `REDIRECT_LINK` sections — either a Smartico DP string (`dp:…`) or an external URL.

***

### liquid\_entity\_data?

> `optional` **liquid\_entity\_data?**: [`LiquidEntityData`](../enumerations/LiquidEntityData.md)[]

Data-context selectors for Liquid templates; see [LiquidEntityData](../enumerations/LiquidEntityData.md).

***

### ach\_tournament\_id?

> `optional` **ach\_tournament\_id?**: `number`

Tournament ID for a single-tournament Liquid template (`LiquidEntityData.Tournament`).

***

### show\_raw\_data?

> `optional` **show\_raw\_data?**: `boolean`

Operator debug flag — when `true`, Liquid renders raw context data instead of the templated HTML.

***

### liquid\_template?

> `optional` **liquid\_template?**: `number`

Liquid template ID resolved server-side; the rendered body is delivered in `body`.

***

### ach\_category\_ids?

> `optional` **ach\_category\_ids?**: `number`[]

Category IDs the section filters badges by — correlate with `getAchCategories()`.

***

### shop\_category\_ids?

> `optional` **shop\_category\_ids?**: `number`[]

Category IDs the section filters store items by — correlate with `getStoreCategories()`.

***

### raffle\_id?

> `optional` **raffle\_id?**: `number`

Raffle ID for `RAFFLE` sections (and `LiquidEntityData.SingleRaffle` Liquid templates).
