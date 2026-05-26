# UI Guide — `getStoreCategories`

## UI guidance
- Treat categories as relatively static. Safe to fetch once on store-page entry and
  reuse for the lifetime of the view; the SDK's 30 s cache handles short-term re-calls.
- Sort by `order` ascending before rendering. Items with the same `order` should fall
  back to `name` or `id` for stable ordering.
- For tab UIs (the common store layout), generate one tab per non-empty category.
  The reference UI also appends the count of items in parentheses on each tab label
  (e.g. `Bonuses (12)`) — compute the count by intersecting `getStoreItems()` with
  each category id.
- If you want an "All items" tab, generate it client-side; the server does not return one.
- Loading indicator: skip on cache hit; show a brief shimmer on cold fetch (typically
  100–300 ms).
- Empty state: when this method returns `[]`, render the store as a flat grid (no tabs,
  no section headers) over `getStoreItems()`.

**Visitor mode**: supported. Use `_smartico.vapi(lang).getStoreCategories()` to fetch
categories with `name` translated to the given language without an authenticated user.
