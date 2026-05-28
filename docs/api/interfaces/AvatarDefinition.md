# Interface: AvatarDefinition

## Properties

### avatar\_real\_id

> **avatar\_real\_id**: `number`

Unique identifier of the avatar

***

### is\_default

> **is\_default**: `boolean`

Whether this avatar is the default one

***

### hide\_until\_achieved

> **hide\_until\_achieved**: `boolean`

If true, avatar is hidden until user achieves/unlocks it

***

### priority

> **priority**: `number`

Display priority — lower value means higher position

***

### public\_meta

> **public\_meta**: `object`

Public metadata containing the avatar image URL and optional description

#### description?

> `optional` **description?**: `string`

Optional description of the avatar

#### url

> **url**: `string`

Image path/URL of the avatar

***

### avatar\_source\_type\_id

> **avatar\_source\_type\_id**: `number`

Source type of the avatar.
0 = free (always available), other values = earned/purchased

***

### active\_from\_date?

> `optional` **active\_from\_date?**: `string`

ISO date string from which the avatar becomes available

***

### active\_till\_date?

> `optional` **active\_till\_date?**: `string`

ISO date string until which the avatar is available

***

### is\_given

> **is\_given**: `boolean`

Whether the avatar has been granted/given to the current user

***

### is\_in\_use?

> `optional` **is\_in\_use?**: `boolean`

Whether this avatar is currently in use by the user
