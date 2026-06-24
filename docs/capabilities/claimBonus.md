# claimBonus — API (TClaimBonusResult)

> Triggers manual redemption of a coupon-model bonus the user has been awarded.
> Import: `import { TClaimBonusResult } from '@smartico/public-api'`
> Search terms: claimBonus, bonuses, TClaimBonusResult, err_code, err_message

## Signature
```ts
_smartico.api.claimBonus(bonus_id: number): Promise<TClaimBonusResult>
```

## Parameters
- `bonus_id` — The `bonus_id` from a `TBonus` returned by `getBonuses`.

## Returns — `Promise<TClaimBonusResult>`
- `err_code` (number) — Error code. `0` = success. See `claimBonus` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
Read the candidate bonus from `getBonuses` and gate the
call on `is_redeemable === true`. The SDK forwards the request
unconditionally — calling on a non-claimable bonus returns
`err_code = -1`.



**Refresh after success (and after failure)**
The SDK automatically refreshes the bonuses cache on every
response (success OR failure) and fires any `onUpdate` callback
registered via `getBonuses`'s `onUpdate`. After
`err_code === 0`, the redeemed bonus shifts from
`COUPON_ISSUED` / `REDEEM_FAILED` to `REDEEMED` on the refreshed
array, with `redeem_date` populated. After a failure, the bonus
typically lands in `REDEEM_FAILED` and remains claimable for a
retry.

**Idempotency**: NOT idempotent at the SDK level. A second call
returns `err_code = -1` once the first has succeeded — treat that
as success in the UI rather than as a real error. Guard the call
site against double-clicks (set a local "claiming" flag on click,
clear it on response).

**Side effects** (on `err_code === 0`)
- Bonus status transitions to `REDEEMED`; `redeem_date` is set.
- The operator's integration credits the player's account
 externally. The SDK does not observe that credit directly —
 balance updates flow over the user-properties channel from the
 operator's side, not from this response.
- Server-side analytics events fire downstream (not directly
 observable from the SDK).

**UI guidance**: see [UI Guide — `claimBonus`](../../docs/ui/bonuses/UIGuide_claimBonus.md).

**Visitor mode**: not supported.

## Example
```ts
const bonuses = await window._smartico.api.getBonuses({
  onUpdate: (refreshed) => console.log('[smartico] bonuses refreshed — re-render from this array', refreshed),
});
const bonus = bonuses.find(b => b.bonus_id === bonusId);

if (!bonus) {
  console.log('[smartico] bonus no longer visible — refresh list and hide CTA');
  return;
}
if (!bonus.is_redeemable) {
  console.log('[smartico] bonus is not claimable (auto-redeemed or already finalised) — keep CTA hidden');
  return;
}

console.log('[smartico] claim starting — set in-flight flag, show loading dots on the Claim button, keep the modal open');
const r = await window._smartico.api.claimBonus(bonus.bonus_id);
console.log('[smartico] claim response received — clear in-flight flag');

if (r.err_code === 0 || r.err_code === -1) {
  console.log('[smartico] claim succeeded (or was already done) — show a success toast; the getBonuses onUpdate above will fire with the refreshed list');
} else if (r.err_code === 9999) {
  console.error('[smartico] uncaught server exception — show a generic error toast and allow retry');
} else {
  console.error('[smartico] claim failed — surface this error message to the user; the bonus will move to REDEEM_FAILED state and remain claimable for a retry:', r.err_message);
}
```

### Example response (REAL shape)
```json
{
  "err_code": -1,
  "err_message": "System Error, Bonus not found or already claimed"
}
```

## Errors
**Error codes** (in `err_code`)

The SDK currently types `err_code` as `SAWSpinErrorCode` for
historical reasons, but the values returned by this method come
from the server's general error space and are NOT mini-game codes.
Branch on the numeric values:

- `0` — success; the bonus has been redeemed and the operator's
 integration has credited the player's account.
- `-1` — bonus not claimable: not found, already claimed by
 another session, or its status is no longer `COUPON_ISSUED` /
 `REDEEM_FAILED`. Treat as idempotent — refresh
 `getBonuses` and reconcile.
- `1` — generic server error. Transient; allow retry after a brief
 delay.
- `9999` — uncaught server exception. Treat as a transient failure;
 surface a generic error and allow retry.
- other non-zero — generic server error. Surface `err_message` if
 any.

**`success` field is unreliable**: the wire response does not
carry a `success` boolean — the field on `TClaimBonusResult` will
be `undefined` in practice. Always branch on `err_code === 0`
for the success check.

## Related
- `getBonuses`
- `SAWSpinErrorCode`
