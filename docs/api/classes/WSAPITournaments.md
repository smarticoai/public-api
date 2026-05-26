# Class: WSAPITournaments
## Methods

### getTournamentsList()

> **getTournamentsList**(`__namedParameters?`): `Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

***

### getTournamentInstanceInfo()

> **getTournamentInstanceInfo**(`tournamentInstanceId`): `Promise`\<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

Returns detailed information for a specific tournament instance; the response includes tournament info and the leaderboard of players

**Example**:
```
_smartico.api.getTournamentsList().then((result) => {
     if (result.length > 0) {
        _smartico.api.getTournamentInstanceInfo(result[0].instance_id).then((result) => {
            console.log(result);
       });
    }
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getTournamentsList().then((result) => {
     if (result.length > 0) {
        _smartico.vapi('EN').getTournamentInstanceInfo(result[0].instance_id).then((result) => {
            console.log(result);
       });
    }
});
```

#### Parameters

##### tournamentInstanceId

`number`

#### Returns

`Promise`\<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

***

### getClanTournamentPlayers()

> **getClanTournamentPlayers**(`tournamentInstanceId`, `clanId`): `Promise`\<[`TClanTournamentPlayers`](../interfaces/TClanTournamentPlayers.md)\>

Returns the players of a specific clan in a clan-based tournament.

**Visitor mode: not supported**

#### Parameters

##### tournamentInstanceId

`number`

##### clanId

`number`

#### Returns

`Promise`\<[`TClanTournamentPlayers`](../interfaces/TClanTournamentPlayers.md)\>

***

### registerInTournament()

> **registerInTournament**(`tournamentInstanceId`): `Promise`\<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

Requests registration for the specified tournament instance. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

##### tournamentInstanceId

`number`

#### Returns

`Promise`\<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

***
