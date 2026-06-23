# Interface: TAvatarCustomized

One AI-generated variant of a base avatar. Returned by `getAvatarsCustomized()`.

## Properties

### avatar\_real\_id

> **avatar\_real\_id**: `number`

`avatar_real_id` of the base avatar this variant was generated from.

***

### url

> **url**: `string`

Absolute CDN URL of the AI-generated image. Can be passed as `avatar_url` to `setAvatar()`.

***

### dt\_created

> **dt\_created**: `number`

Unix-ms timestamp of when the variant was generated.
