# UI Guide — `getAvatarPrompts`

## Overview
- Returns the AI style prompts (e.g. "Cartoon", "Watercolor", "Cyberpunk")
  available for avatar customization.
- Each prompt declares a cost in points / gems / diamonds — applying the
  prompt deducts that cost server-side as part of the AI generation
  request.
- Use to power the style-picker list inside the customization modal.
- 30 s cache; no push subscription; lazy-load on customization-modal
  open.

## List view organization

Single flat list. No tabs / no sort hint from the server — present in
the order returned.

The default Smartico UI shows prompts as a vertical scrollable list with
one row per prompt.

## Item card / row

Fields rendered per row:

| Field | Source | Notes |
|---|---|---|
| Style icon | `icon_url` | 1:1, ~48 × 48 px |
| Name | `name` | Display label of the style |
| Cost icon | derived from `cost_currency_type_id` | Points / gems / diamonds icon |
| Cost amount | `cost_value` | Numeric, e.g. "100" |

**Click target**: tap selects the prompt; selection drives the AI
generation request.

## Affordability check

Compare `cost_value` against the live balance from
[`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)
based on `cost_currency_type_id`:

| `cost_currency_type_id` | Balance source |
|---|---|
| `0` | `profile.points_balance` |
| `1` | `profile.gems_balance` |
| `2` | `profile.diamonds_balance` |

Prompts the user cannot afford should be visually disabled but still
visible — the server is the source of truth and enforces the balance
check authoritatively. The default Smartico UI dims unaffordable
prompts but does NOT hide them.

## Status-specific visual treatments

| Status | Visual |
|---|---|
| Affordable | Normal |
| Unaffordable | Dimmed / desaturated; CTA disabled |
| Selected | Highlight ring / accent border |

## Empty / loading / error states

- **Empty**: "No customization styles available" — usually means the AI
  customization feature is disabled on the label.
- **Loading**: skeleton list (3–4 placeholder rows).
- **Error**: non-blocking banner; keep prior list.

## Refresh

- 30 s SDK cache.
- Not invalidated by
  [`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar) — prompts
  are catalog metadata, independent of the user's active avatar.
- Not invalidated by the AI generation HTTP POST (prompts don't change
  per-user).
- No push subscription.

## Triggering AI generation (out of scope for the SDK)

When the user picks a prompt and confirms, the consumer POSTs to the
operator-configured `avatar-customize` HTTP endpoint with the chosen
`prompt_id`, the base `avatar_real_id`, and the base avatar URL. The
server runs the AI generation (synchronous HTTP — the request blocks
until generation completes) and returns a new CDN URL.

After success, re-call
[`getAvatarsCustomized`](../../api/classes/WSAPIAvatars.md#getavatarscustomized)
to surface the new variant, then optionally apply it with
[`setAvatar`](../../api/classes/WSAPIAvatars.md#setavatar).

## Mobile vs desktop

- **Row density**: identical on both.
- **Modal layout**: full-screen sheet on mobile; centered dialog on
  desktop.

## Performance

- 30 s cache absorbs modal re-opens.
- Lazy-load — call on modal open, not on app boot.
- Pre-load icon images at modal open time for snappy scrolling.
