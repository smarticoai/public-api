# getAchCategories — API (TAchCategory)

> Returns the list of active mission/badge categories configured for the current label.
> Import: `import { TAchCategory } from '@smartico/public-api'`
> Search terms: getAchCategories, missions, TAchCategory, id, name, order

## Signature
```ts
_smartico.api.getAchCategories(): Promise<TAchCategory[]>
```

## Parameters
_None._

## Returns — `Promise<TAchCategory[]>`
Array of `TAchCategory`. Each item:
- `id` (number) — Stable numeric ID of the category. Used as the key when joining to `TMissionOrBadge.category_ids: number[]`.
- `name` (string) — Display name of the category, pre-translated server-side. Never null.
- `order` (number) — Relative display position (lower = appears first). Default 1 when the operator did not configure an explicit order.

## Behavioral contract
**What categories are**
- Operator-defined groupings, configured per-label by the brand operator.
  Only active categories are returned; inactive/deleted ones are filtered out.
- Each `TAchCategory` exposes `{ id, name, order }`. `name` is the display label;
  `order` is the relative position (lower = appears first).
- The same array covers BOTH missions and badges — categories are not filtered by
  entity type on the server.

**Localization / translation**
- `name` is **pre-translated server-side** to the authenticated user's stored language.
  In visitor mode, the language passed to `_smartico.vapi(lang)` drives the
  translation. Consumers never need to translate `name` themselves.
- Fallback if no translation exists for the user's language: the brand's EN value
  is returned. The field is never null.

**Sort order**
The server does NOT pre-sort. Sort client-side before rendering:
`categories.sort((a, b) => a.order - b.order)`.

**How missions/badges join to categories**
Each `TMissionOrBadge` exposes `category_ids: number[]` (zero-or-more,
many-to-many). A single mission/badge can belong to multiple categories
simultaneously, or to none. To render a "category → items" view:
`missions.filter(m => m.category_ids.includes(cat.id))`.

**Uncategorized items**
Items with `category_ids: []` are NOT represented by a synthetic "Other" entry.
If your UI needs one, generate it client-side by checking
`item.category_ids.length === 0`.

**Empty categories**
A category may be returned even if zero missions/badges reference it. Filter
out empty categories on the consumer side if you don't want to render section
headers for them.

**Refresh cadence / cache**
- The SDK caches the response for 30 seconds. Subsequent calls within that
  window return the cached array without a network round-trip.
- The cache is NOT invalidated by mission/badge push events — operator-driven
  category changes propagate at the next 30 s cache miss.
- Cache is fully cleared on login / logout.
- In **visitor mode** additional server-side caching applies on top of the
  SDK cache; worst-case staleness for an edited/added category is on the order
  of a few minutes for anonymous viewers.

**Idempotency**: safe. Read-only metadata fetch. Cache de-duplicates concurrent calls.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getAchCategories`](../../docs/ui/missions/UIGuide_getAchCategories.md).

## Example
```ts
const categories = await window._smartico.api.getAchCategories();

if (categories.length === 0) {
  console.log('[smartico] no categories configured — render missions/badges as a flat list without section headers');
} else {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  console.log('[smartico] categories loaded — render one tab/section per entry in this order:', sorted.map(c => c.name));

  // Join to missions: render each category as a section
  const missions = await window._smartico.api.getMissions();
  for (const cat of sorted) {
    const items = missions.filter(m => m.category_ids.includes(cat.id));
    if (items.length === 0) {
      console.log('[smartico] category has no missions — skip rendering its section header:', cat.name);
      continue;
    }
    console.log(`[smartico] render section "${cat.name}" with ${items.length} mission(s)`);
  }

  // Uncategorized items: surface in a caller-provided "Other" bucket if needed
  const uncategorized = missions.filter(m => m.category_ids.length === 0);
  if (uncategorized.length > 0) {
    console.log('[smartico] uncategorized missions exist — render a caller-provided "Other" section; server does NOT return id:-1:', uncategorized.length);
  }
}

// Visitor mode — same shape, language driven by vapi(lang) argument
const visitorCats = await window._smartico.vapi('DE').getAchCategories();
console.log('[smartico] visitor-mode categories (names translated to DE):', visitorCats);
```

### Example response (REAL shape)
```json
[
  {
    "id": 27,
    "name": "Lucky Badges",
    "order": 3
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.
