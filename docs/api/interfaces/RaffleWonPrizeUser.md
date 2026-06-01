# Interface: RaffleWonPrizeUser

The user the won-prizes list belongs to.

## Properties

### user\_id

> **user\_id**: `number`

Internal user ID.

***

### avatar\_id

> **avatar\_id**: `string`

Avatar image: a full URL for a system avatar, otherwise an avatar token to resolve against the widget's avatar domain.

***

### avatar\_real\_id

> **avatar\_real\_id**: `number`

Numeric ID of the user's selected avatar definition.

***

### public\_username?

> `optional` **public\_username?**: `string`

Public username; server-masked for other users (e.g. `"32:r*****"`).

***

### avatar\_url?

> `optional` **avatar\_url?**: `string`

Always `null` on the wire — use `avatar_id`.
