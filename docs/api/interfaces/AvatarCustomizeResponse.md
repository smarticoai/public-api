# Interface: AvatarCustomizeResponse

Result of `_smartico.api.avatarsCustomize()`. On success only `cdn_url` is
set; on failure only `errCode` / `errMessage`.

## Properties

### cdn\_url?

> `optional` **cdn\_url?**: `string`

CDN URL of the generated avatar variant. Present on success.

***

### errCode?

> `optional` **errCode?**: `number`

Error code. Present on failure. Typed values are members of
[AvatarCustomizeErrorCode](../enumerations/AvatarCustomizeErrorCode.md); `-1` is a generic failure. See the
`avatarsCustomize` TSDoc for the full table.

***

### errMessage?

> `optional` **errMessage?**: `string`

Optional error message. Present on failure; the generic (`-1`) message
is fixed text, so branch on `errCode`, not this string.
