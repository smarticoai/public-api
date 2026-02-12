# Interface: TBuyStoreItemResult

## Properties

### err\_code

• **err\_code**: [`BuyStoreItemErrorCode`](../enums/BuyStoreItemErrorCode.md)

Error code representing the result of the purchase of the shop item. Successful purchase if err_code is 0 

Example for error handling:
```javascript
SmarticoAPI.buyStoreItem(item_id).then(res => {
  if (res.err_code !== 0) {
    // YOUR LOGIC HERE, you can use res.err_message, but it's optional and not always present
  }
});
```

___

### err\_message

• **err\_message**: `string`

Optional error message
