# Interface: GamePickBoardUser

GamePickBoardUser describes a user's entry on the round leaderboard

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

Display name shown on the leaderboard

___

### avatar\_url

• **avatar\_url**: `string`

URL of the user's avatar image

___

### gp\_position

• **gp\_position**: `number`

User's rank position on the leaderboard, null if not yet ranked

___

### resolution\_score

• **resolution\_score**: `number`

User's total score in this round/season

___

### full\_wins\_count

• **full\_wins\_count**: `number`

Number of fully correct predictions

___

### part\_wins\_count

• **part\_wins\_count**: `number`

Number of partially correct predictions

___

### lost\_count

• **lost\_count**: `number`

Number of incorrect predictions
