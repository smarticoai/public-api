# Class: WSAPILeaderBoard
## Methods

### getLeaderBoard()

> **getLeaderBoard**(`periodType`, `getPreviousPeriod?`): `Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

Returns the leaderboard for the current type (default is Daily). If getPreviousPeriod is passed as true, a leaderboard for the previous period for the current type will be returned.
For example, if the type is Weekly and getPreviousPeriod is true, a leaderboard for the previous week will be returned.

**Example**:
```
_smartico.api.getLeaderBoard(1).then((result) => {
    console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getLeaderBoard(1).then((result) => {
   console.log(result);
});
```

#### Parameters

##### periodType

[`LeaderBoardPeriodType`](../enumerations/LeaderBoardPeriodType.md)

##### getPreviousPeriod?

`boolean`

#### Returns

`Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

***
