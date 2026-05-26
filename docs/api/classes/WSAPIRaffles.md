# Class: WSAPIRaffles
## Methods

### getRaffles()

> **getRaffles**(`__namedParameters?`): `Promise`\<[`TRaffle`](../interfaces/TRaffle.md)[]\>

Returns the list of Raffles available for user
The returned list of Raffles is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getRaffles with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on claiming prize.  Updated Raffles will be passed to onUpdate callback.

**Example**:

```
_smartico.api.getRaffles().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```
_smartico.vapi('EN').getRaffles().then((result) => {
     console.log(result);
});
```

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TRaffle`](../interfaces/TRaffle.md)[]\>

***

### getRaffleDrawRun()

> **getRaffleDrawRun**(`props`): `Promise`\<[`TRaffleDraw`](../interfaces/TRaffleDraw.md)\>

Returns draw run for provided raffle_id and run_id.
You can pass winners_from and winners_to parameters to get a specific range of winners. Default is 0-20.

**Example**:

```javascript
_smartico.api.getRaffleDrawRun({raffle_id: 156, run_id: 145}).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').getRaffleDrawRun({ raffle_id: 156, run_id: 145 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### raffle_id

`number`

###### run_id

`number`

###### winners_from?

`number`

###### winners_to?

`number`

#### Returns

`Promise`\<[`TRaffleDraw`](../interfaces/TRaffleDraw.md)\>

***

### getRaffleDrawRunsHistory()

> **getRaffleDrawRunsHistory**(`props`): `Promise`\<[`TRaffleDrawRun`](../interfaces/TRaffleDrawRun.md)[]\>

Returns history of draw runs for the provided raffle_id and draw_id, if the draw_id is not provided will return history of all the draws for the provided raffle_id

**Example**:

```javascript
_smartico.api.getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### raffle_id

`number`

###### draw_id?

`number`

#### Returns

`Promise`\<[`TRaffleDrawRun`](../interfaces/TRaffleDrawRun.md)[]\>

***

### claimRafflePrize()

> **claimRafflePrize**(`props`): `Promise`\<[`TransformedRaffleClaimPrizeResponse`](../interfaces/TransformedRaffleClaimPrizeResponse.md)\>

Returns `err_code` and `err_message` after the call; `err_code` 0 means the request succeeded.

**Example**:

```javascript
_smartico.api.claimRafflePrize({won_id:251}).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').claimRafflePrize({ won_id: 251 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### won_id

`number`

#### Returns

`Promise`\<[`TransformedRaffleClaimPrizeResponse`](../interfaces/TransformedRaffleClaimPrizeResponse.md)\>

***

### requestRaffleOptin()

> **requestRaffleOptin**(`props`): `Promise`\<[`TRaffleOptinResponse`](../interfaces/TRaffleOptinResponse.md)\>

Requests an opt-in for the specified raffle. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

##### props

###### raffle_id

`number`

###### draw_id

`number`

###### raffle_run_id

`number`

#### Returns

`Promise`\<[`TRaffleOptinResponse`](../interfaces/TRaffleOptinResponse.md)\>

***
