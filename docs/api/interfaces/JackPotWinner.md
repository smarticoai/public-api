# Interface: JackPotWinner

## Properties

### is\_me

> **is\_me**: `boolean`

Flag indicating that this winner is the currently logged in user

***

### public\_username

> **public\_username**: `string`

Name of the winner, note that for all users except is_me, the name is masked by default, but masking can be disabled by request to Smartico AM team

***

### winning\_amount\_jp\_currency

> **winning\_amount\_jp\_currency**: `number`

Won amount in the Jackpot currency

***

### winning\_amount\_wallet\_currency

> **winning\_amount\_wallet\_currency**: `number`

Won amount in the user Wallet currency

***

### winning\_position

> **winning\_position**: `number`

Position of the winner. Relevant for jackpots where there could be multiple winners

***

### avatar\_id

> **avatar\_id**: `string`

Avatar of the winner
