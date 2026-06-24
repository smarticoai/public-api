# getBonuses — API (TBonus)

> Returns the bonuses awarded to the current user — both pending (player-claim required) and already-redeemed.
> Import: `import { TBonus } from '@smartico/public-api'`
> Search terms: getBonuses, bonuses, TBonus, BonusStatus, BonusTemplateMetaMap, BonusMetaMap, onUpdate, subscription, bonus_id, is_redeemable, create_date, redeem_date, label_bonus_template_id, bonus_status_id, label_bonus_template_meta_map, bonus_meta_map

## Signature
```ts
_smartico.api.getBonuses({ onUpdate }: { onUpdate?: (data: TBonus[]) => void } = {}): Promise<TBonus[]>
```

## Parameters
- `params` — Optional. Omit to fetch without subscribing.
- `params.onUpdate` — Callback invoked with the full refreshed bonuses list after every `claimBonus` resolves. Each call to `getBonuses` overwrites the prior callback.

## Returns — `Promise<TBonus[]>`
Array of `TBonus`. Each item:
- `bonus_id` (number) — Stable ID of the bonus.
- `is_redeemable` (boolean) — `true` when the bonus is in a player-claim-required state. Gate the Claim button on this; see `claimBonus` TSDoc.
- `create_date` (string) — Bonus creation timestamp as ISO 8601 UTC string ("YYYY-MM-DDTHH:MM:SS", no timezone suffix).
- `redeem_date` (string) — Bonus redemption timestamp as ISO 8601 UTC string. Absent until the bonus reaches `BonusStatus.REDEEMED`.
- `label_bonus_template_id` (number) — ID of the bonus template used to issue this bonus.
- `bonus_status_id` (BonusStatus) — Lifecycle status; see `BonusStatus`.
- `label_bonus_template_meta_map` (BonusTemplateMetaMap) — Template-level display metadata (operator-configured, identical across all bonuses from the same template).
  - `description` (string) — Operator-set description / display text. May include HTML.
  - `acknowledge` (string) — Operator-set additional message shown to the player at claim time (e.g. wagering terms). May include deep-links.
  - `image_url` (string) — Bonus icon URL (1:1 aspect ratio recommended).
  - `redirect_url` (string) — Optional redirect — external HTTP URL (opens in new tab) or internal deep-link (handled by the SDK's deep-link router).
- `bonus_meta_map` (BonusMetaMap) — Instance-level display metadata (per-issuance; carries the dynamic amount computed at award time).
  - `uiAmount` (string) — Display-ready amount string (e.g. "€50", "100 free spins").

## Behavioral contract
**Subscription model (`onUpdate`)**
The callback receives the FULL refreshed bonuses list (never a
diff/patch). Each subsequent call to `getBonuses({ onUpdate })`
REPLACES the prior callback. Pass `onUpdate: undefined` (or omit
it) to keep the prior callback in place; the callback is never
auto-cleared.

**Update triggers** — the callback fires after every
`claimBonus` call resolves on this connection (success OR
failure). This is the ONLY trigger.

Does NOT fire when: a new bonus is awarded server-side
(CRM rule, mission completion, store purchase, etc.), a bonus
expires, or an operator manually issues / cancels a bonus. Those
changes surface only on the next cache miss (after the 30 s TTL).
Re-call `getBonuses()` manually if your UI needs near-live state
for server-driven awards.

**Reading state from the returned bonus**
Drive UI bucketing from `bonus_status_id` (enum `BonusStatus`):

- `COUPON_ISSUED` (2) — actionable; player must claim. Pair with
 `is_redeemable === true` to gate the Claim button.
- `REDEEM_FAILED` (4) — also actionable; the previous claim
 attempt failed but the bonus is still valid. Surface a retry CTA
 — the default Smartico UI treats this identically to
 `COUPON_ISSUED` from the player's perspective.
- `REDEEMED` (3) — historical; show in a "claimed" tab.
- `New` (1), `COUPON_ISSUE_FAILED` (5), `EXPIRED` (6) — these
 should not normally reach the client and are typically filtered
 out by operator-side widget configuration; if they do appear,
 they have no player-actionable state.

`is_redeemable` is the authoritative gate for showing the Claim
button — it's `true` only when the bonus is in a claimable status
AND the operator's integration uses a coupon model (where the
player must explicitly trigger delivery). Auto-redeemed bonuses
arrive already in `REDEEMED` state with `is_redeemable: false`.

**Field hierarchy — display amount**
Bonuses carry both template-level (`label_bonus_template_meta_map.description`)
and instance-level (`bonus_meta_map.uiAmount`) display strings.
Prefer `bonus_meta_map.uiAmount` when present — it's the dynamic
amount computed at issuance time (e.g. from a dynamic-bonus
formula). Fall back to `label_bonus_template_meta_map.description`
(which can include HTML; sanitize before injecting).

**Date format**
`create_date` and `redeem_date` are ISO 8601 UTC strings WITHOUT
a timezone suffix (`"YYYY-MM-DDTHH:MM:SS"`). Parse as UTC and
display in the user's local timezone. `redeem_date` is absent
until the bonus reaches `REDEEMED` status.

**Cache TTL**: the SDK caches the response for 30 seconds. Cache
is fully cleared on login / logout.

**Idempotency / Side effects**: safe. Read-only.

**UI guidance**: see [UI Guide — `getBonuses`](../../docs/ui/bonuses/UIGuide_getBonuses.md).

**Visitor mode**: not supported.

## Example
```ts
const bonuses = await window._smartico.api.getBonuses({
  onUpdate: (refreshed) => {
    console.log('[smartico] bonuses refreshed (after claimBonus) — re-render the bonuses UI from this array:', refreshed);
  },
});

// Bucket into pending vs redeemed tabs. The default Smartico UI groups
// COUPON_ISSUED + REDEEM_FAILED into the same "Pending" tab.
const pending = bonuses.filter(b =>
  b.bonus_status_id === 2 || b.bonus_status_id === 4  // COUPON_ISSUED or REDEEM_FAILED
);
const redeemed = bonuses.filter(b => b.bonus_status_id === 3);  // REDEEMED

console.log('[smartico] render bonus tabs: pending=', pending.length, 'redeemed=', redeemed.length);

// Render each pending bonus card; show Claim button only when redeemable.
for (const b of pending) {
  const amount = b.bonus_meta_map?.uiAmount || b.label_bonus_template_meta_map?.description;
  if (b.is_redeemable) {
    console.log('[smartico] render Claim button for bonus', b.bonus_id, '— amount:', amount);
  } else {
    console.log('[smartico] render bonus as informational (no Claim button) — amount:', amount);
  }
}

// Server-awarded bonuses (e.g. from a CRM campaign) do NOT push;
// poll if you need near-live awareness.
setInterval(async () => {
  const fresh = await window._smartico.api.getBonuses();
  const newCount = fresh.filter(b => b.bonus_status_id === 2 || b.bonus_status_id === 4).length;
  console.log('[smartico] poll tick — pending bonuses now:', newCount);
}, 30_000);
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "bonus_id": 910171929,
    "is_redeemable": false,
    "create_date": "09/06/2026 23:05:03",
    "redeem_date": "09/06/2026 23:05:03",
    "label_bonus_template_id": 2152,
    "bonus_status_id": 3,
    "label_bonus_template_meta_map": {
      "name": "",
      "description": "100 Euro Free Chip",
      "image_url": "https://cdn.example/4011a701f070093978f2df-Storeitemcopy12.png"
    },
    "bonus_meta_map": {
      "uiAmount": "100 EUR Big Bonus "
    }
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `BonusStatus`
- `claimBonus`
