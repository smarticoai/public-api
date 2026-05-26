# Class: WSAPIJackpots
## Methods

### jackpotGet()

> **jackpotGet**(`filter?`): `Promise`\<[`JackpotDetails`](../interfaces/JackpotDetails.md)[]\>

Returns list of Jackpots that are active in the system and matching to the filter definition.
If filter is not provided, all active jackpots will be returned.
Filter can be used to get jackpots related to specific game or specific jackpot template.
You can call this method every second in order to get up to date information about current value of the jackpot(s) and present them to the end-users

**Example**:
```
_smartico.api.jackpotGet({ related_game_id: 'wooko-slot' }).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').jackpotGet({ related_game_id: 'wooko-slot' }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### filter?

###### related_game_id?

`string`

###### jp_template_id?

`number`

#### Returns

`Promise`\<[`JackpotDetails`](../interfaces/JackpotDetails.md)[]\>

***

### jackpotOptIn()

> **jackpotOptIn**(`filter`): `Promise`\<[`JackpotsOptinResponse`](../interfaces/JackpotsOptinResponse.md)\>

Opt-in currently logged in user to the jackpot with the specified jp_template_id.
You may call jackpotGet method after doing optin to see that user is opted in to the jackpot.

**Example**:
```
_smartico.api.jackpotOptIn({ jp_template_id: 123 }).then((result) => {
     console.log('Opted in to the jackpot');
});
```

**Visitor mode: not supported**

#### Parameters

##### filter

###### jp_template_id

`number`

#### Returns

`Promise`\<[`JackpotsOptinResponse`](../interfaces/JackpotsOptinResponse.md)\>

***

### jackpotOptOut()

> **jackpotOptOut**(`filter`): `Promise`\<[`JackpotsOptoutResponse`](../interfaces/JackpotsOptoutResponse.md)\>

Opt-out currently logged in user from the jackpot with the specified jp_template_id.
You may call jackpotGet method after doing optout to see that user is not opted in to the jackpot.

**Example**:
```
_smartico.api.jackpotOptOut({ jp_template_id: 123 }).then((result) => {
     console.log('Opted out from the jackpot');
});
```

**Visitor mode: not supported**

#### Parameters

##### filter

###### jp_template_id

`number`

#### Returns

`Promise`\<[`JackpotsOptoutResponse`](../interfaces/JackpotsOptoutResponse.md)\>

***

### getJackpotWinners()

> **getJackpotWinners**(`params`): `Promise`\<[`JackpotWinnerHistory`](../interfaces/JackpotWinnerHistory.md)[]\>

Returns jackpot winners for the given `jp_template_id` (paginated on the server).
Default page size on the wire is 20; use `limit`, `offset`, and repeated calls to load more.
The full protocol response also includes `has_more`; this method returns only the `winners` array.

**Example**:
```
_smartico.api.getJackpotWinners({
     jp_template_id: 123,
}).then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Jackpot winners parameters

###### limit?

`number`

Page size (server default 20 when omitted)

###### offset?

`number`

Offset into the winner list

###### jp_template_id?

`number`

Jackpot template id (required; throws if missing)

#### Returns

`Promise`\<[`JackpotWinnerHistory`](../interfaces/JackpotWinnerHistory.md)[]\>

***

### getJackpotEligibleGames()

> **getJackpotEligibleGames**(`__namedParameters`): `Promise`\<[`TGetJackpotEligibleGamesResponse`](../interfaces/TGetJackpotEligibleGamesResponse.md)\>

Returns the eligible games for the jackpot with the specified jp_template_id.

**Example**:
```
_smartico.api.getJackpotEligibleGames({ jp_template_id: 123 }).then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters

###### jp_template_id

`number`

###### onUpdate?

() => `void`

#### Returns

`Promise`\<[`TGetJackpotEligibleGamesResponse`](../interfaces/TGetJackpotEligibleGamesResponse.md)\>

***
