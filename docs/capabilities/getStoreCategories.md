# getStoreCategories — API (TStoreCategory)

> Returns the list of active store categories configured for the current label.
> Import: `import { TStoreCategory } from '@smartico/public-api'`
> Search terms: getStoreCategories, store, TStoreCategory, id, name, order

## Signature
```ts
_smartico.api.getStoreCategories(): Promise<TStoreCategory[]>
```

## Parameters
_None._

## Returns — `Promise<TStoreCategory[]>`
Array of `TStoreCategory`. Each item:
- `id` (number) — ID of the store category
- `name` (string) — Name of the store category
- `order` (number) — Order of the store category among other categories. Default value is 1

## Behavioral contract
**What categories are**
- Operator-defined groupings, configured per-label by the brand operator.
 Only active categories are returned; inactive / archived / deleted ones are
 filtered out server-side.
- Each `TStoreCategory` exposes `{ id, name, order }`. `name` is the display label;
 `order` is the relative position (lower = appears first).
- The same set of categories is returned to every user of the label — there is no
 per-segment / per-currency / per-device filtering on the category list. Item-level
 segment visibility happens on `getStoreItems`, not here.

**Localization / translation**
- `name` is **pre-translated server-side** to the authenticated user's stored language.
 In visitor mode, the language passed to `_smartico.vapi(lang)` drives the translation.
 Consumers never need to translate `name` themselves.
- Fallback if no translation exists for the user's language: the operator-set default
 (typically the brand's English) value is returned. The field is never null for an
 active category.

**Sort order**
The server does NOT pre-sort. Sort client-side before rendering:
`categories.sort((a, b) => a.order - b.order)`.

**How store items join to categories**
Each `TStoreItem` exposes `category_ids: number[]` (zero-or-more, many-to-many).
A single store item can belong to multiple categories, or to none. To render a
"category → items" view:
`items.filter(i => i.category_ids.includes(cat.id))`.

**Uncategorized items**
Items with `category_ids: []` are NOT represented by a synthetic "Other" entry
in the response. The convention used by the reference store UI is to synthesize
a client-side bucket (e.g. labelled "General") for items that have no category, OR
for items whose `category_ids` reference a category that is no longer returned by
this method (e.g. archived since the item was tagged). If you choose to render
such a synthetic bucket, place it first (the reference UI uses an `order: -1`
convention so it precedes all operator-defined categories).

**Empty categories**
A category may be returned even if zero items currently reference it (since this
method does not join against items). The reference store UI hides such empty
categories from its tab strip — replicate that filter if you don't want to render
tabs that lead to empty content panels.

**Refresh cadence / cache**
- The SDK caches the response for 30 seconds. Subsequent calls within that window
 return the cached array without a network round-trip.
- The cache is NOT invalidated by store-item push events or purchases — operator-driven
 category changes propagate at the next 30 s cache miss.
- Cache is fully cleared on login / logout.
- In **visitor mode**, additional server-side caching applies on top of the SDK cache;
 worst-case staleness for an edited/added category is on the order of a few minutes
 for anonymous viewers.

**Idempotency**: safe. Read-only metadata fetch. Cache de-duplicates concurrent calls.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getStoreCategories`](../../docs/ui/store/UIGuide_getStoreCategories.md).

## Example
```ts
const [categories, items] = await Promise.all([
  window._smartico.api.getStoreCategories(),
  window._smartico.api.getStoreItems(),
]);

if (categories.length === 0) {
  console.log('[smartico] no store categories configured — render items as a flat grid without tabs:', items.length);
} else {
  // Sort categories; build per-category item buckets; hide empty categories
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const tabs = sorted
    .map(cat => ({ cat, items: items.filter(i => i.category_ids?.includes(cat.id)) }))
    .filter(t => t.items.length > 0);

  // Optional: synthesize an "Other" bucket for items with no (or unknown) category
  const knownIds = new Set(categories.map(c => c.id));
  const orphans = items.filter(i => !i.category_ids?.length || !i.category_ids.some(id => knownIds.has(id)));
  if (orphans.length > 0) {
    console.log('[smartico] uncategorized store items — render a client-synthesized "Other" tab at the front of the tab strip:', orphans.length);
  }

  console.log('[smartico] render store tabs in this order with these counts:', tabs.map(t => `${t.cat.name} (${t.items.length})`));
}

// Visitor mode — same shape, language driven by vapi(lang) argument
const visitorCats = await window._smartico.vapi('DE').getStoreCategories();
console.log('[smartico] visitor-mode store categories (names translated to DE):', visitorCats);
```

### Example response (REAL shape)
```json
[
  {
    "id": 568,
    "name": "Currency",
    "order": 7
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getStoreItems`
