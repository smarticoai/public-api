# Interface: GamesApiResponse\<T\>

GamesApiResponse is the standard response wrapper for all GamePick/Quiz API calls

## Type Parameters

### T

`T`

## Properties

### errCode

> **errCode**: `number`

Error code; `0` = success. Per-method code tables live in each `gamePick*` method's TSDoc.

***

### errMessage?

> `optional` **errMessage?**: `string`

Human-readable error message; populated when `errCode` is non-zero.

***

### data?

> `optional` **data?**: `T`

Response payload, present on success
