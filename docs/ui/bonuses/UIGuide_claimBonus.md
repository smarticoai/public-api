# UI Guide — `claimBonus`

## Overview
- Action-focused mutation. The user is on the bonuses screen, the
  CTA is "Claim" on a pending bonus tile, and they click it.
- Success (`err_code === 0`) means the operator's integration has
  been called to credit the bonus to the player's account. The
  status flips to `REDEEMED` and the bonuses list auto-refreshes
  via [`getBonuses`](../../api/classes/WSAPIBonuses.md#getbonuses)'s
  `onUpdate`.
- Latency: typically 300 ms – 2 s — the server calls the operator's
  bonus API synchronously inside the claim handler, so slow
  operator endpoints translate to slow claim responses.
- Balance updates do NOT arrive in the claim response — the
  operator credits the player externally and the change surfaces
  separately (typically via the SDK's user-properties channel).

## Loading state

- **Trigger**: set an in-flight flag (`claiming = true`) immediately
  on click, BEFORE the call.
- **Visual**: replace the button label with animated dots / spinner.
  Disable the button. Keep the claim modal open during the call.
- **Reset**: clear the flag on response — success or error.

Latency can reach 1–2 s for slow operator integrations. Use a
clearly-visible loading state (dots ≥ 3 frames, button width
preserved to prevent layout jump).

## Idempotency UI guard

The SDK does NOT prevent double-clicks. Two simultaneous calls
both reach the server. The first succeeds; the second returns
`err_code = -1` (bonus already claimed). Guard the call site:

```ts
const [claiming, setClaiming] = useState(false);

const onClaim = async () => {
  if (claiming) return;                          // in-flight guard
  if (!bonus.is_redeemable) return;              // not claimable
  setClaiming(true);
  const r = await window._smartico.api.claimBonus(bonus.bonus_id);
  setClaiming(false);
  handleResponse(r);
};
```

Treat `err_code === -1` (already claimed) as **idempotent success**
in the UI — close the modal, show the success toast, let the
auto-refresh land. Don't show an error.

## Action button decision matrix

| `err_code` | Action |
|---|---|
| `0` (success) | Close the claim modal · Show a success toast (e.g. "Bonus claimed!") · The bonuses list auto-refreshes via `onUpdate`; the bonus moves from Pending to Redeemed tab on the next render — DON'T manually re-fetch. Balance credit arrives separately through the operator's integration. |
| `-1` (not claimable / already claimed) | Same as success — treat as idempotent. Usually means another tab/session already claimed it (or the bonus expired between list fetch and click). |
| `1` (generic server error) | Show a generic error toast. Allow retry — the bonus typically lands in `REDEEM_FAILED` and remains claimable. |
| `9999` (uncaught exception) | Same as `1` — generic error toast, retry allowed. |
| Other non-zero | Show a generic error toast with `err_message` if present. Allow retry. |

The bonus's `bonus_status_id` after a failed claim is typically
`REDEEM_FAILED (4)`. The default Smartico UI treats `REDEEM_FAILED`
identically to `COUPON_ISSUED` — the user sees a normal Claim
button on their next visit and can retry without any "previously
failed" indicator.

## `success` field — ignore it

The wire response does NOT consistently carry a `success` boolean.
The `TClaimBonusResult.success?: boolean` field will be `undefined`
in practice. **Always branch on `err_code === 0`** for the success
check, not on the `success` field.

## Acknowledge message — pre-click

`label_bonus_template_meta_map.acknowledge` is the operator-supplied
text shown in the claim modal (wagering terms, expiry notice, etc.).
It is **template-level and static** — shown regardless of whether
the user has clicked Claim yet, and regardless of whether the
claim eventually succeeds. Render it always in the modal body when
present.

## Optimistic update

**Do NOT optimistically flip `bonus_status_id` to `REDEEMED`** before
the response. The server can fail (operator integration timeout,
business-rule rejection), and the failure state needs to surface as
a real error. Keep the bonus in its prior state until the response
lands.

The in-flight `claiming` flag provides the visual feedback during
the wait.

## Refresh after response

The SDK auto-refreshes the bonuses cache on every response (success
OR error) via the same push that delivers the claim result. The
`onUpdate` callback registered via `getBonuses({ onUpdate })` fires
with the refreshed array shortly after — **don't manually call
`getBonuses()` after a claim response**, the refresh is already
happening.

The user's balance update (after a successful claim) does NOT come
through the bonuses channel. The operator's integration credits the
player externally; balance updates surface via
[`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)'s
`props_change` push channel — subscribe there separately if your UI
shows the balance.

## Animations / transitions

- **Loading dots**: 3-dot bouncing animation on the button while
  the promise is in flight.
- **Modal close on success**: animate the modal closure (~150 ms
  ease-out).
- **Card cross-tab transition**: when the bonus moves from Pending
  to Redeemed (detected via diffing the prior + refreshed lists
  inside `onUpdate`), the default Smartico UI does not animate the
  move — it relies on the list-level fade-in for the new Redeemed
  card.
- **No celebration animation** (no confetti, no sound) — bonus claim
  uses a plain success toast. Mission and store claims have
  celebrations; bonuses don't.

## Mobile vs desktop

- **Loading state**: identical (dots animation on the button).
- **Error surfacing**: desktop typically uses a toast/snackbar;
  mobile may use a centered modal with a clear "OK" affordance.
- **Modal style**: desktop centered with backdrop dim; mobile
  full-screen slide-up sheet.

## Performance

- Single round-trip per click. The handler invokes the operator's
  bonus API synchronously, so latency depends on the operator's
  endpoint responsiveness.
- The refresh after the response (server push → SDK cache write →
  `onUpdate` fire) adds ~50–100 ms beyond the claim response —
  fine for UI purposes.
- Don't poll `getBonuses()` to detect claim completion — the
  response promise is the authoritative signal.
