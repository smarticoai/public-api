# Interface: GamesApiResponse\<T\>

GamesApiResponse is the standard response wrapper for all GamePick/Quiz API calls

## Type Parameters

### T

`T`

## Properties

### errCode

> **errCode**: `number`

Error code: 0 on success, non-zero on failure

***

### errMessage?

> `optional` **errMessage?**: `string`

Human-readable error message when errCode is non-zero

***

### data?

> `optional` **data?**: `T`

Response payload, present on success
