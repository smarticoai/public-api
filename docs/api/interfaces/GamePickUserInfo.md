# Interface: GamePickUserInfo

GamePickUserInfo describes the current user's profile in the games system

## Properties

### ext\_user\_id

• **ext\_user\_id**: `string`

External user ID (Smartico numeric user ID)

___

### int\_user\_id

• **int\_user\_id**: `number`

Internal user ID within the games system

___

### public\_username

• **public\_username**: `string`

Display name

___

### avatar\_url

• **avatar\_url**: `string`

URL of the user's avatar image

___

### gp\_position

• `Optional` **gp\_position**: `number`

User's leaderboard rank position

___

### full\_wins\_count

• `Optional` **full\_wins\_count**: `number`

Number of fully correct predictions

___

### part\_wins\_count

• `Optional` **part\_wins\_count**: `number`

Number of partially correct predictions

___

### resolution\_score

• `Optional` **resolution\_score**: `number`

User's total score

___

### last\_wallet\_sync\_time

• `Optional` **last\_wallet\_sync\_time**: `Date`

Last time the user's balance was synced from the Smartico platform

___

### ach\_points\_balance

• `Optional` **ach\_points\_balance**: `number`

User's current points balance

___

### ach\_gems\_balance

• `Optional` **ach\_gems\_balance**: `number`

User's current gems balance

___

### ach\_diamonds\_balance

• `Optional` **ach\_diamonds\_balance**: `number`

User's current diamonds balance

___

### pubic\_username\_set

• `Optional` **pubic\_username\_set**: `boolean`

Whether the user has set a custom public username
