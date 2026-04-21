# Interface: GamePickUserInfo

GamePickUserInfo describes the current user's profile in the games system

## Properties

### ext\_user\_id

> **ext\_user\_id**: `string`

External user ID (Smartico numeric user ID)

***

### int\_user\_id

> **int\_user\_id**: `number`

Internal user ID within the games system

***

### public\_username

> **public\_username**: `string`

Display name

***

### avatar\_url

> **avatar\_url**: `string`

URL of the user's avatar image

***

### gp\_position?

> `optional` **gp\_position?**: `number`

User's leaderboard rank position

***

### full\_wins\_count?

> `optional` **full\_wins\_count?**: `number`

Number of fully correct predictions

***

### part\_wins\_count?

> `optional` **part\_wins\_count?**: `number`

Number of partially correct predictions

***

### resolution\_score?

> `optional` **resolution\_score?**: `number`

User's total score

***

### last\_wallet\_sync\_time?

> `optional` **last\_wallet\_sync\_time?**: `Date`

Last time the user's balance was synced from the Smartico platform

***

### ach\_points\_balance?

> `optional` **ach\_points\_balance?**: `number`

User's current points balance

***

### ach\_gems\_balance?

> `optional` **ach\_gems\_balance?**: `number`

User's current gems balance

***

### ach\_diamonds\_balance?

> `optional` **ach\_diamonds\_balance?**: `number`

User's current diamonds balance

***

### pubic\_username\_set?

> `optional` **pubic\_username\_set?**: `boolean`

Whether the user has set a custom public username
