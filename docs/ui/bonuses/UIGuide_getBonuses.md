# UI Guide — `getBonuses`

## Overview
- Returns the user's bonuses (pending claims, redeemed history, and —
  rarely — internal statuses). Drive the rendering from
  `bonus_status_id` ({@link BonusStatus}) and `is_redeemable`.
- The list refreshes automatically only after
  [`claimBonus`](../../api/classes/WSAPIBonuses.md#claimbonus). Server-
  awarded bonuses (CRM, mission rewards, store redemptions) do NOT
  push — poll on the 30 s cache TTL if you need near-live awareness.
- Loading indicator: skip on cache hit; show a shimmer on cold fetch
  (typically 100–500 ms).

## List view organization

The default Smartico UI splits bonuses into **two tabs**:

| Tab | Bucket rule | Sort |
|---|---|---|
| **Pending** | `bonus_status_id === 2` (`COUPON_ISSUED`) OR `bonus_status_id === 4` (`REDEEM_FAILED`) | `create_date` DESC |
| **Redeemed** | `bonus_status_id === 3` (`REDEEMED`) | `redeem_date` DESC |

Status values `New (1)`, `COUPON_ISSUE_FAILED (5)`, `EXPIRED (6)` are
typically filtered out by widget-level operator configuration. If they
appear, the default UI does not surface them — drop them from your
render.

**Pending tab auto-hides**: when the Pending bucket is empty, the
default Smartico UI removes the tab strip entirely and shows only the
Redeemed list. Restore the tab strip when a fresh pending bonus
appears (e.g. after a poll-driven refresh).

**Bucketing helper** for custom UIs:

```ts
function bucket(bonus) {
  if (bonus.bonus_status_id === 2 || bonus.bonus_status_id === 4) return 'pending';
  if (bonus.bonus_status_id === 3) return 'redeemed';
  return null;  // drop internal statuses from the UI
}
```

## Bonus card / tile

Fields rendered per tile:

| Field | Source | Notes |
|---|---|---|
| Icon | `label_bonus_template_meta_map.image_url` | 1:1 aspect ratio. No SDK-provided fallback — supply a neutral placeholder if missing. |
| Amount / title | Prefer `bonus_meta_map.uiAmount` (e.g. `"€50"`, `"100 free spins"`); fall back to `label_bonus_template_meta_map.description` | `description` may include HTML; sanitize before injecting. |
| Date | `create_date` for pending bonuses; `redeem_date` for redeemed bonuses | ISO 8601 UTC; parse and format in user's local time (`new Date(create_date + 'Z')`). |
| Redirect affordance | Small icon when `label_bonus_template_meta_map.redirect_url` is set | Separate click target from the card itself (don't open the claim modal on icon click). |

**Whole-card click target** behavior depends on the bonus state:
- Pending + `is_redeemable: true` → opens the claim modal (see "Action
  button decision matrix").
- All other states → card is non-interactive (apply a CSS class like
  `hover-disable` and suppress the click handler).

## Detail / claim modal

When the user clicks a claimable card, open a modal showing:

  1. Bonus icon (`label_bonus_template_meta_map.image_url`) at a
     larger size.
  2. Amount / title (same fields as the card).
  3. Description (`label_bonus_template_meta_map.description`, HTML).
  4. **Acknowledge message** —
     `label_bonus_template_meta_map.acknowledge` — operator-supplied
     text always shown when set (wagering terms, expiry notice,
     etc.). May include deep-links — pass through the SDK's deep-link
     handler for safe execution.
  5. Claim button (see "Action button decision matrix").

The acknowledge message is **template-level static text**, not a
dynamic success message — it appears regardless of whether the
claim succeeds.

## Action button decision matrix

Drive the Claim CTA from `bonus_status_id` + `is_redeemable`:

| `bonus_status_id` | `is_redeemable` | UI state |
|---|---|---|
| `COUPON_ISSUED` (2) | `true` | Claim button enabled — primary CTA |
| `REDEEM_FAILED` (4) | `true` | Claim button enabled — "Try again" label is appropriate; the default Smartico UI treats this identically to first-time claim |
| `COUPON_ISSUED` / `REDEEM_FAILED` | `false` | Card is informational only; no Claim button (auto-redeemed integration) |
| `REDEEMED` (3) | (irrelevant) | History row; no Claim button; show `redeem_date` |
| `New` / `COUPON_ISSUE_FAILED` / `EXPIRED` | — | Drop from UI |

Clicking the Claim button invokes
[`claimBonus`](../../api/classes/WSAPIBonuses.md#claimbonus). See its
own UI guide for the in-flight + per-error-code matrix.

## Image / asset specs

| Field | Aspect ratio | Notes |
|---|---|---|
| `label_bonus_template_meta_map.image_url` | 1:1 (square) | Operator-supplied; recommended ~256×256 px. Fallback: render a neutral bonus icon if missing. |

## Status-specific visual treatments

- **Pending (`COUPON_ISSUED` / `REDEEM_FAILED`)**: full-color card,
  pointer cursor, clickable.
- **Non-redeemable pending** (`is_redeemable: false`): identical
  visual but `hover-disable` CSS class, no click handler.
- **Redeemed**: same visual; appears in the Redeemed tab only; show
  the redemption date.
- **No status-specific colors / badges** in the default Smartico UI
  — branding for "successfully redeemed" lives only in tab placement,
  not in the card chrome.

`REDEEM_FAILED` is visually identical to `COUPON_ISSUED` from the
player's perspective. The "failed" state is a server-internal
distinction that lets the integration record a prior failed attempt
without losing the bonus. Don't surface "failed" in the UI copy —
treat it as "claim available".

## `redirect_url` handling

When `label_bonus_template_meta_map.redirect_url` is set, render a
small redirect icon on the card. Click behavior:

- URL starts with `http` / `https` → open in a new browser tab
  (`window.open(url, '_blank')`).
- Anything else → treat as an internal deep-link; pass to the SDK's
  deep-link handler (`_smartico.dp(url)`).

The redirect click target is **separate from** the card's click
target. Stop event propagation on the icon click so the claim modal
does not open simultaneously.

## Empty / loading / error states

- **Loading (cold fetch)**: render a skeleton grid (3–6 placeholder
  cards) matching the eventual layout.
- **Loading (cache hit)**: do not render a loading state — the
  promise resolves within a microtask.
- **Empty list**: `[]` means no bonuses are visible. Show a neutral
  empty-state illustration with copy like "No bonuses available".
- **Empty Pending tab (but Redeemed has items)**: per the default
  Smartico UI, hide the tab strip entirely and show only the
  Redeemed list. Reverse when a poll-driven refresh restores
  pending bonuses.
- **Error**: keep the prior list visible if any; show a small
  non-blocking error banner; retry on the next user-driven action.

## Animations / transitions

- **Card entry**: stagger fade-in (~30 ms per card) on first render.
- **Card transition on claim success**: the redeemed bonus's card
  fades out from the Pending tab and the Redeemed tab gains a new
  card on its next render. The default Smartico UI does not animate
  the cross-tab move — bonus rendering relies on the standard list
  refresh.
- **No celebration animation on claim success** — unlike mission /
  store claim, bonuses use a plain success toast.

## Mobile vs desktop

- **Grid columns**: desktop typically 2–3 columns; mobile 1
  (full-width cards).
- **Tab strip**: identical on both; auto-hidden when Pending is
  empty.
- **Detail modal**: desktop centered with backdrop dim; mobile
  full-screen slide-up.

## Performance

- The 30 s cache deduplicates rapid refetches. A poll loop every
  5 s effectively translates to one round-trip per 30 s.
- Diff snapshots between fetches to detect status flips and animate
  only the affected cards.
- For very large bonus histories, virtualize the Redeemed tab with
  `IntersectionObserver` — the default Smartico UI doesn't
  paginate, so the full list is rendered.
