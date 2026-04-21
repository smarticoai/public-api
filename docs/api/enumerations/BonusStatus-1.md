# Enumeration: BonusStatus

## Enumeration Members

### New

> **New**: `1`

The bonus is newly created (shouldn't be shown to the client)

***

### COUPON\_ISSUED

> **COUPON\_ISSUED**: `2`

The bonus is issued and available for redemption but has not been redeemed yet

***

### REDEEMED

> **REDEEMED**: `3`

The bonus has been successfully redeemed

***

### REDEEM\_FAILED

> **REDEEM\_FAILED**: `4`

The bonus is still valid, but a previous redemption attempt failed

***

### COUPON\_ISSUE\_FAILED

> **COUPON\_ISSUE\_FAILED**: `5`

Failed to issue the bonus (shouldn't be shown to the client)

***

### EXPIRED

> **EXPIRED**: `6`

The bonus was issued but has expired and can no longer be redeemed (shouldn't be shown to the client)
