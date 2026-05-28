# Interface: TAvatarDefinition

One avatar in the user's catalog. Returned by `getAvatarsList()`.
Fields from the raw `public_meta` object are flattened to the top level.

## Properties

### avatar\_real\_id

> **avatar\_real\_id**: `number`

Stable numeric identifier of the avatar. Primary key passed to `setAvatar()`.

***

### is\_default

> **is\_default**: `boolean`

True when this is the system default avatar for the label.

***

### hide\_until\_achieved

> **hide\_until\_achieved**: `boolean`

When true and `is_given === false`, the avatar should be hidden from the user (surprise unlock).

***

### priority

> **priority**: `number`

Display position; lower = earlier in the grid.

***

### description?

> `optional` **description?**: `string`

Optional description shown alongside the avatar in detail views.

***

### url

> **url**: `string`

Raw image path as returned by the server (relative or absolute).

***

### avatar\_url

> **avatar\_url**: `string`

Absolute CDN URL of the avatar image; built from the configured avatar domain + `url`.

***

### avatar\_source\_type\_id

> **avatar\_source\_type\_id**: `number`

Source type. `0` = free / always available; non-zero = earned or purchased.

***

### active\_from\_date?

> `optional` **active\_from\_date?**: `string`

ISO date string from which the avatar becomes available; undefined when no start window.

***

### active\_till\_date?

> `optional` **active\_till\_date?**: `string`

ISO date string until which the avatar is available; undefined when no end window.

***

### is\_given

> **is\_given**: `boolean`

True when the user owns / has unlocked this avatar.

***

### is\_in\_use?

> `optional` **is\_in\_use?**: `boolean`

True when this avatar is the user's currently active profile avatar.
