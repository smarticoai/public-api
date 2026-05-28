# Enumeration: BonusStatus

BonusStatus describes the lifecycle stage of a bonus on `TBonus.bonus_status_id`.
Operator widget configuration typically filters out internal statuses
(`New`, `COUPON_ISSUE_FAILED`, `EXPIRED`); consumers usually see
`COUPON_ISSUED`, `REDEEMED`, and `REDEEM_FAILED`.

## Enumeration Members

### New

> **New**: `1`

Newly created, not yet processed (internal).

***

### COUPON\_ISSUED

> **COUPON\_ISSUED**: `2`

Issued and awaiting player claim.

***

### REDEEMED

> **REDEEMED**: `3`

Successfully redeemed.

***

### REDEEM\_FAILED

> **REDEEM\_FAILED**: `4`

Previous redemption attempt failed; still valid and re-claimable.

***

### COUPON\_ISSUE\_FAILED

> **COUPON\_ISSUE\_FAILED**: `5`

Coupon issuance failed (internal).

***

### EXPIRED

> **EXPIRED**: `6`

Issued but expired before redemption (internal).
