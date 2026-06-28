# Interface: TClanTournamentPlayers

TClanTournamentPlayers describes the players of a specific clan in a clan-based tournament.

## Properties

### tournament\_instance\_id

> **tournament\_instance\_id**: `number`

Tournament instance ID

***

### players

> **players**: `object`[]

Top players of this clan ranked by score DESC

#### user\_id

> **user\_id**: `number`

Smartico User ID

#### clean\_ext\_user\_id

> **clean\_ext\_user\_id**: `string`

External User ID

#### public\_username

> **public\_username**: `string`

Public username

#### avatar\_id

> **avatar\_id**: `string`

Avatar ID

#### avatar\_real\_id

> **avatar\_real\_id**: `number`

Avatar real ID

#### avatar\_url?

> `optional` **avatar\_url?**: `string`

Avatar URL

#### position

> **position**: `number`

Position in the leaderboard

#### scores

> **scores**: `number`

Score of the player

#### is\_me

> **is\_me**: `boolean`

Indicator if record is the current user
