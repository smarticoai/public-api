# Interface: TAchCategory

TAchCategory describes a mission/badge category. Categories are
operator-defined groupings, configured per-label by the brand operator,
shared across BOTH missions and badges — the same list is returned for
both entity types. A mission or badge can belong to **zero or more**
categories (many-to-many) via its `category_ids: number[]` field on
`TMissionOrBadge`.

Returned by `_smartico.api.getAchCategories()`. See that method's TSDoc
for translation, refresh, and rendering details.

## Properties

### id

> **id**: `number`

Stable numeric ID of the category. Used as the key when joining to
`TMissionOrBadge.category_ids: number[]`.

***

### name

> **name**: `string`

Display name of the category, pre-translated server-side. Never null.

***

### order

> **order**: `number`

Relative display position (lower = appears first). Default 1 when the
operator did not configure an explicit order.
