# Interface: TClanTournamentPlayers

TClanTournamentPlayers describes the players of a specific clan in a clan-based tournament.

## Properties

### clan\_id

> **clan\_id**: `number`

Clan ID

***

### clan\_public\_meta

> **clan\_public\_meta**: `object`

Clan display metadata

#### name

> **name**: `string`

#### image\_url

> **image\_url**: `string`

***

### players

> **players**: `object`[]

Top players of this clan ranked by score DESC

#### user\_id

> **user\_id**: `number`

#### public\_username

> **public\_username**: `string`

#### avatar\_id

> **avatar\_id**: `string`

#### avatar\_real\_id

> **avatar\_real\_id**: `number`

#### avatar\_url?

> `optional` **avatar\_url?**: `string`

#### position

> **position**: `number`

#### scores

> **scores**: `number`

#### is\_me

> **is\_me**: `boolean`

#### clean\_ext\_user\_id

> **clean\_ext\_user\_id**: `string`
