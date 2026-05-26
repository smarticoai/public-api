# UI Guide — `getAchCategories`

## UI guidance
- Treat categories as relatively static. It is safe to fetch once on page load and
  reuse for the lifetime of the view; the SDK's 30 s cache handles short-term re-calls.
- Sort by `order` ascending before rendering. Items with the same `order` should
  fall back to `name` or `id` for stable ordering.
- For tab UIs, generate one tab per category; "All" / "Other" tabs are
  caller-provided (not returned by the server).
- For section UIs (mission/badge listing grouped by category), iterate sorted
  categories and render only those whose filtered item list is non-empty unless
  you intentionally want empty sections.
- Loading indicator: skip on cache hit; show a brief shimmer on cold fetch
  (typically 100–300 ms).

**Visitor mode**: supported. Use `_smartico.vapi(lang).getAchCategories()` to fetch
categories with `name` translated to the given language without an authenticated user.
