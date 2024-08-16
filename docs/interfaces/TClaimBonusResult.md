# Interface: TClaimBonusResult

TClaimBonusResult describes the response of call to _smartico.api.claimBonus(bonus_id) method

## Properties

### err\_code

• **err\_code**: [`SAWSpinErrorCode`](../enums/SAWSpinErrorCode.md)

Error code that represents outcome of the game play attempt. Game succeed to be played in case err_code is 0

___

### err\_message

• **err\_message**: `string`

Optional error message

___

### success

• `Optional` **success**: `boolean`

If the bonus was claimed successfully, then success is true
