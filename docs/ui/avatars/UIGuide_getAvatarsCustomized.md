# UI Guide — `getAvatarsCustomized`

## Overview
- Returns the user's previously generated AI-customized avatar variants.
- Each entry is one AI-generated image tied to a base avatar
  (`avatar_real_id` refers to the base from
  [`getAvatarsList`](../../api/classes/WSAPIAvatars.md#getavatarslist)).
- Power the "My variants" carousel inside the customization modal.
- 30 s cache; no push subscription.

## List view organization

Variants are best grouped client-side by `avatar_real_id`, then sorted
within each group by `dt_created` descending (newest first):

```ts
const byBase = new Map<number, TAvatarCustomized[]>();
for (const v of variants) {
  const list = byBase.get(v.avatar_real_id) ?? [];
  list.push(v);
  byBase.set(v.avatar_real_id, list);
}
for (const list of byBase.values()) {
  list.sort((a, b) => b.dt_created.localeCompare(a.dt_created));
}
```

The default Smartico UI presents variants as a horizontally-scrollable
carousel under each base avatar in the customization modal.

## Item card / row

Fields rendered per variant:

| Field | Source | Notes |
|---|---|---|
| Variant image | `url` | 256 × 256 px |
| Creation date | `dt_created` | Optional — "Generated 2 days ago" |
| Apply CTA | local | Tap to set as profile avatar via [`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar) |

**Click target**: tap selects the variant in the preview area; "Apply"
in the bottom bar calls
[`setAvatar({ avatar_url: variant.url, avatar_real_id: variant.avatar_real_id })`](../../api/classes/WSAPIAvatars.md#setavatar).

## Image / asset specs

- **Variant**: 256 × 256 px (1:1) — typically rendered larger than
  catalog tiles to showcase the AI generation.
- **Format**: WebP when supported; PNG fallback.
- **Origin**: served from the operator-configured avatar CDN.

## Empty / loading / error states

- **Empty (new user, no variants)**: show only the base avatar preview;
  do not render an empty carousel. The default Smartico UI shows the
  selected base avatar as a single-item fallback.
- **Loading**: skeleton placeholder over the preview area.
- **Error**: keep the prior list if any; non-blocking error banner.

## Refresh

- 30 s SDK cache.
- [`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar) clears this
  cache as a side effect.
- **AI generation is outside this SDK.** After the operator-configured
  `avatar-customize` HTTP POST resolves successfully, re-call
  `getAvatarsCustomized()` to surface the new variant (the SDK cannot
  auto-invalidate because the customization request is not WS-based).
- No push subscription.

## Relation to `getAvatarsList`

AI variants do NOT appear in
[`getAvatarsList`](../../api/classes/WSAPIAvatars.md#getavatarslist) —
they're stored separately under the user record. A combined "all my
avatars" view requires merging both collections client-side.

## Mobile vs desktop

- **Carousel**: horizontal scroll on mobile; arrow navigation + scroll
  on desktop.
- **Preview size**: 256 × 256 px on both; mobile fits one variant per
  screen width.

## Performance

- 30 s cache absorbs picker re-opens.
- Pre-load variant images at customization-modal open time.
- Don't poll — variants only change after a customization run, which
  the consumer controls.
