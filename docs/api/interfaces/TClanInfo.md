# Interface: TClanInfo

TClanInfo describes the detailed info of a single clan including its members.
Returned by `_smartico.api.getClanInfo(clanId)`.

## Properties

### clan\_id

> **clan\_id**: `number`

Clan ID.

***

### public\_meta

> **public\_meta**: `object`

Translated clan metadata (name, description, image URL).

#### name

> **name**: `string`

#### description

> **description**: `string`

#### image\_url

> **image\_url**: `string`

***

### member\_count

> **member\_count**: `number`

Current number of members in clan.

***

### capacity\_limit

> **capacity\_limit**: `number`

Max number of members allowed in clan.

***

### entry\_fee\_currency\_type\_id

> **entry\_fee\_currency\_type\_id**: `number`

Currency type for `entry_fee_amount`. `0` = points, `1` = gems,
`2` = diamonds, `3` = free.

***

### entry\_fee\_amount

> **entry\_fee\_amount**: `number`

Entry fee amount in the currency indicated by `entry_fee_currency_type_id`.

***

### rating\_position

> **rating\_position**: `number`

Global rank among all active clans in the label, by `rating_score` DESC.
`1` = highest-rated.

***

### rating\_score

> **rating\_score**: `number`

Clan rating score (higher is better).

***

### cooldown\_until

> **cooldown\_until**: `string`

User-level switch-cooldown expiry as ISO 8601 UTC string
("YYYY-MM-DDTHH:MM:SS" with no timezone suffix). `null` when no
cooldown. Same semantic as `TClans.cooldown_until` but always fresh
(the list version may be up to 30 s stale).

***

### members

> **members**: `object`[]

Members of this clan, server-ordered by `contribution_score` DESC
(i.e. `position` ASC).

#### user\_id

> **user\_id**: `number`

Member's internal user ID.

#### public\_username

> **public\_username**: `string`

Member's display username.

#### avatar\_id

> **avatar\_id**: `string`

Avatar identifier; resolve via `avatar_url` below or rebuild
from `avatar_id` + brand avatar domain.

#### avatar\_real\_id

> **avatar\_real\_id**: `number`

Numeric avatar ID (alternative identifier).

#### avatar\_url?

> `optional` **avatar\_url?**: `string`

Pre-resolved CDN URL for the avatar.

#### position

> **position**: `number`

Member's rank within this clan; `1` = top contributor.

#### contribution\_score

> **contribution\_score**: `number`

Member's contribution to the clan rating score.

#### is\_me?

> `optional` **is\_me?**: `boolean`

`true` when this row is the current authenticated user.

#### clean\_ext\_user\_id?

> `optional` **clean\_ext\_user\_id?**: `string`

External user identifier (operator-provided alias);
preferred over `public_username` on some surfaces.
