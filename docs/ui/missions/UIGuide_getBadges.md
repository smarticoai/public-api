# UI Guide — `getBadges`

## UI guidance
- Show a loading state on the first call (cold cache requires a
  server round-trip); subsequent calls within 30 s resolve from cache
  synchronously-ish.
- Group results by `category_ids` against [getAchCategories](../../api/classes/WSAPIMissions.md#getachcategories); do
  NOT reuse a missions-style flat list — the badge UX convention is
  a category-grouped grid.
- Render `badgeTimeLimitState` (not `time_limit_ms`) for availability
  labels like "Starts on …", "Until …", "Expired".
- Do not show opt-in buttons, claim-prize buttons, or task
  descriptions; these are mission concepts.

**Visitor mode: not supported.** Use [getMissions](../../api/classes/WSAPIMissions.md#getmissions) (visitor mode
supported) or [getAchCategories](../../api/classes/WSAPIMissions.md#getachcategories) (visitor mode supported) if you
need achievement data for anonymous users. Calling
`_smartico.vapi(lang).getBadges()` returns no usable data — visitor
sessions have no badge-progress path on the server.
