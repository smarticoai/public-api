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

Display name of the category. **Pre-translated server-side** to the authenticated
user's stored language (or to the language passed to `_smartico.vapi(lang)` in
visitor mode). Falls back to the EN base name when a translation is missing — never
null. Consumers should NOT translate this further.

***

### order

> **order**: `number`

Relative position among other categories (lower = appears first). The server does
NOT pre-sort by this value — the consumer must sort:
`categories.sort((a, b) => a.order - b.order)`. Default value is 1 when the
operator did not configure an explicit order.
