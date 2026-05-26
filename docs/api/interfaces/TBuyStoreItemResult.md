# Interface: TBuyStoreItemResult

## Properties

### err\_code

> **err\_code**: [`BuyStoreItemErrorCode`](../enumerations/BuyStoreItemErrorCode.md)

Outcome of the store-item purchase. `0` means the purchase succeeded
(funds debited, reward delivered server-side); any non-zero value
signals a failure.

The typed values are the named codes in the [BuyStoreItemErrorCode](../enumerations/BuyStoreItemErrorCode.md)
enum, but the field is `number` at runtime — the server can also emit
codes that are NOT in the public enum (`1`, `106`, `11007`, `9999` —
see the full table on `buyStoreItem` in WSAPI). Always branch on the
known codes first and fall back to a generic error handler for
anything else.

See the `buyStoreItem` TSDoc for the full error-code table, the
Buy-button decision matrix, and per-code UI guidance.

Example for error handling:
```ts
const res = await window._smartico.api.buyStoreItem(item_id);
if (res.err_code === 0) {
  console.log('[smartico] purchase succeeded — close the detail modal, show a success toast; the SDK auto-refreshes getStoreItems and the purchased-items list');
} else if (res.err_code === 11000 || res.err_code === 11011 || res.err_code === 11012) {
  console.error('[smartico] insufficient balance — show insufficient-balance UI for the item.purchase_type');
} else if (res.err_code === 11009) {
  console.error('[smartico] sold out — show a "Sold out" message');
} else {
  console.error('[smartico] purchase failed — show a generic error with this message:', res.err_message);
}
```

***

### err\_message

> **err\_message**: `string`

Optional server-side error message describing the failure. Present
only on non-zero `err_code`, and even then can be empty. For codes
that have operator-defined copy on the item itself (`11006` →
`limit_message`, `11014` → `purchase_limit_message`), prefer the
item-level copy and use `err_message` only as a fallback.
