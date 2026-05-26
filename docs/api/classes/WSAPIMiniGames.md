# Class: WSAPIMiniGames
## Methods

### getMiniGames()

> **getMiniGames**(`__namedParameters?`): `Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Returns the list of mini-games configured for the current user (not filtered by spin availability or Widget visibility).
The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.getMiniGames().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getMiniGames().then((result) => {
     console.log(result);
});
```

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

***

### getMiniGamesHistory()

> **getMiniGamesHistory**(`__namedParameters`): `Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

Returns the list of mini-games based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
The maximum number of items per request is limited to 20.
You can leave this params empty and by default it will return list of mini-games ranging from 0 to 20.
The returned list of mini-games history is cached for 30 seconds.

**Example**:
```
_smartico.api.getMiniGamesHistory().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters

###### limit?

`number`

###### offset?

`number`

###### saw_template_id?

`number`

#### Returns

`Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

***

### playMiniGame()

> **playMiniGame**(`template_id`, `__namedParameters?`): `Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
After playMiniGame is called, you can call getMiniGames to get the list of mini-games.The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGame with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.playMiniGame(55).then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### template\_id

`number`

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

***

### miniGameWinAcknowledgeRequest()

> **miniGameWinAcknowledgeRequest**(`request_id`): `Promise`\<[`SAWDoAknowledgeResponse`](../interfaces/SAWDoAknowledgeResponse.md)\>

Sends the acknowledge request with specific client_request_id from minigame history in order to claim prize
**Example**:
```
_smartico.api.miniGameWinAcknowledgeRequest('2a189322-31bb-4119-b943-bx7868ff8dc3').then((result) => {
     console.log(result);
});
```

#### Parameters

##### request\_id

`string`

#### Returns

`Promise`\<[`SAWDoAknowledgeResponse`](../interfaces/SAWDoAknowledgeResponse.md)\>

***

### playMiniGameBatch()

> **playMiniGameBatch**(`template_id`, `spin_count`, `__namedParameters?`): `Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

Plays the specified by template_id mini-game on behalf of user spin_count times and returns array of the prizes
After playMiniGameBatch is called, you can call getMiniGames to get the list of mini-games. The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGameBatch with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or won prize is spin/jackpot and if max count of the available user spins equals one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.playMiniGameBatch(55, 10).then((result) => {
     console.log(result);
});
```
**Visitor mode: not supported**

#### Parameters

##### template\_id

`number`

##### spin\_count

`number`

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

***
