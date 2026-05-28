# Interface: TBuyStoreItemResult

Result of `_smartico.api.buyStoreItem(store_item_id)`.

## Properties

### err\_code

> **err\_code**: [`BuyStoreItemErrorCode`](../enumerations/BuyStoreItemErrorCode.md)

Error code. `0` = success. See `buyStoreItem` TSDoc for the full table.

***

### err\_message

> **err\_message**: `string`

Optional error message; populated on non-zero `err_code`.
