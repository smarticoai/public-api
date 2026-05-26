# Class: WSAPIBonuses
## Methods

### getBonuses()

> **getBonuses**(`__namedParameters?`): `Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

Returns all the bonuses for the current user
The returned bonuses are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

***

### claimBonus()

> **claimBonus**(`bonus_id`): `Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

Claim the bonus by bonus_id. Returns the err_code in case of success or error.
Note that this method can be used only on integrations where originally failed bonus can be claimed again.
For example, user won a bonus in the mini-game, but Operator rejected this bonus.
This bonus will be available for the user to claim again.

**Visitor mode: not supported**

#### Parameters

##### bonus\_id

`number`

#### Returns

`Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

***
