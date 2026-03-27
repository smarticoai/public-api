# Interface: GamesApiResponse\<T\>

GamesApiResponse is the standard response wrapper for all GamePick/Quiz API calls

## Type parameters

| Name |
| :------ |
| `T` |

## Properties

### errCode

• **errCode**: `number`

Error code: 0 on success, non-zero on failure

___

### errMessage

• `Optional` **errMessage**: `string`

Human-readable error message when errCode is non-zero

___

### data

• `Optional` **data**: `T`

Response payload, present on success
