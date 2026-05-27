# UI Guide — `getAvatarsList`

## Overview
- Returns the avatar catalog plus per-user unlock flags (`is_given`, `is_in_use`).
- Use to power the avatar picker grid in the user profile screen.
- 30 s cache; no push subscription. Re-call after
  [`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar) to refresh
  `is_in_use`.

## Grid layout

Single flat grid — no tabs / no filter chips in the default Smartico UI.

Pre-render pipeline:

```ts
const visible = avatars
  .filter((a) => !a.hide_until_achieved || a.is_given)
  .sort((a, b) => a.priority - b.priority);
```

| Property | Value |
|---|---|
| Tile aspect ratio | 1:1 (square) |
| Default tile size | 128 × 128 px |
| Column count | 3 on mobile (~360 px), 4–5 on desktop |
| Sort | `priority` ascending (lower = first) |
| Visibility filter | drop `hide_until_achieved && !is_given` |

## Item card / tile

Fields rendered per tile:

| Field | Source | Notes |
|---|---|---|
| Avatar image | `avatar_url` | 128 × 128 px |
| "In use" overlay | `is_in_use === true` | Checkmark badge top-right |
| Lock overlay | `!is_given && avatar_source_type_id !== 0` | "?" placeholder instead of image; grayscale/dim |
| Selection ring | local UI state | Apply ring when user taps but hasn't confirmed |

**Click target**: single tap selects the avatar (local state). A separate
"Apply" button submits — tap-to-select is NOT tap-to-apply.

## Action button decision matrix

The picker has a bottom bar with an "Apply" button:

| State | Apply button |
|---|---|
| Selected avatar `is_in_use` | Label "In Use", disabled |
| Selected avatar `is_given` (or free) | Label "Apply", enabled |
| Selected avatar locked | Apply hidden / disabled; show unlock requirement instead |
| Apply in flight | Disabled with spinner |

## Image / asset specs

- **Tile**: 128 × 128 px (1:1).
- **Detail / preview**: 256 × 256 px (1:1).
- **Format**: WebP when supported by the browser; PNG fallback.
- **CDN resize path**: the `avatar_url` is the full-resolution image; the
  consumer should request the resize variant for grid tiles to save
  bandwidth (e.g. `…/resize/128/128/webp/…`). The exact path scheme is
  operator-configured.

## Status-specific visual treatments

| Status | Visual |
|---|---|
| In use | Checkmark overlay top-right |
| Selected (not yet applied) | Highlight ring around the tile |
| Locked (earned, not given) | "?" placeholder image; dimmed |
| `hide_until_achieved` and not given | Filtered out — does NOT render |

## Empty / loading / error states

- **Loading (cold fetch)**: skeleton grid (6–9 placeholder tiles).
- **Empty**: "No avatars available" — uncommon, suggests label
  misconfiguration.
- **Error**: keep the previous catalog if present; non-blocking error
  banner.

## Refresh

- 30 s SDK cache deduplicates rapid re-fetches.
- No push subscription. Re-call after a successful
  [`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar) (the SDK
  auto-clears the cache so the next call goes through).
- When the user earns a new avatar (`is_given` flips server-side), the
  change surfaces only on the next call after the cache window expires.

## Mobile vs desktop

- **Tile size**: identical; column count adjusts to viewport width.
- **Picker layout**: full-screen sheet on mobile; centered modal on
  desktop.

## Performance

- 30 s cache + immediate post-mutation invalidation balances staleness
  vs. roundtrip count.
- Pre-load grid images at picker open time (the user almost always opens
  the picker to scan multiple avatars).
- AI-customized variants do NOT appear in this list — they live in
  [`getAvatarsCustomized`](../../api/classes/WSAPIAvatars.md#getavatarscustomized).
  Combine the two collections client-side if the UI shows them together.
