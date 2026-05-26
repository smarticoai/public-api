# Class: WSAPIGamePick
## Methods

### gamePickGetActiveRounds()

> **gamePickGetActiveRounds**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Returns the active rounds for the specified MatchX or Quiz game.
Each round includes its events (matches/questions) along with the current user's selections and scores.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

***

### gamePickGetActiveRound()

> **gamePickGetActiveRound**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Returns a single active round for the specified MatchX or Quiz game.
The round includes full event details with the current user's selections.

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

***

### gamePickGetHistory()

> **gamePickGetHistory**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

Returns the history of all rounds (including resolved ones) for the specified MatchX or Quiz game.
Each round contains full event details with results and the current user's predictions.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)[]\>\>

***

### gamePickGetBoard()

> **gamePickGetBoard**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRoundBoard`](../interfaces/GamePickRoundBoard.md)\>\>

Returns the leaderboard for a specific round within a MatchX or Quiz game.
Use `round_id = -1` (AllRoundsGameBoardID) to get the season/overall leaderboard across all rounds.

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRoundBoard`](../interfaces/GamePickRoundBoard.md)\>\>

***

### gamePickSubmitSelection()

> **gamePickSubmitSelection**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Submits score predictions for a round in a MatchX game.
Sends the round object with user selections for all events at once.
Each event must include `team1_user_selection` and `team2_user_selection` representing predicted scores.
If the user hasn't placed bets before, one game attempt (spin) will be consumed.
Predictions can be edited until each match starts (if `allow_edit_answers` is enabled on the round).

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

***

### gamePickSubmitSelectionQuiz()

> **gamePickSubmitSelectionQuiz**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Submits answers for a round in a Quiz game.
Sends the round object with user answers for all events at once.
Each event must include `user_selection` with the answer value (e.g. '1', '2', 'x', 'yes', 'no' — depending on the market type).
If the user hasn't placed bets before, one game attempt (spin) will be consumed.
Answers can be edited until each match starts (if `allow_edit_answers` is enabled on the round).

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

***

### gamePickGetUserInfo()

> **gamePickGetUserInfo**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickUserInfo`](../interfaces/GamePickUserInfo.md)\>\>

Returns the current user's profile information within the specified MatchX or Quiz game.
The user record is synced from the Smartico platform into the games DB (synced every 1 minute).
If the user doesn't exist in the games DB yet, it will be created automatically on first call.

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickUserInfo`](../interfaces/GamePickUserInfo.md)\>\>

***

### gamePickGetGameInfo()

> **gamePickGetGameInfo**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickGameInfo`](../interfaces/GamePickGameInfo.md)\>\>

Returns the game configuration and the list of all rounds for the specified MatchX or Quiz game.
Includes the SAW template definition, label settings, and round metadata (without events).

#### Parameters

##### props

[`GamePickRequestParams`](../interfaces/GamePickRequestParams.md)

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickGameInfo`](../interfaces/GamePickGameInfo.md)\>\>

***

### gamePickGetRoundInfoForUser()

> **gamePickGetRoundInfoForUser**(`props`): `Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

Returns round data with events and picks for a specific user (identified by their internal user ID).
Useful for viewing another user's predictions from the leaderboard.
The `int_user_id` can be obtained from the `gamePickGetBoard` response (`users[].int_user_id`).

#### Parameters

##### props

[`GamePickRoundRequestParams`](../interfaces/GamePickRoundRequestParams.md) & `object`

#### Returns

`Promise`\<[`GamesApiResponse`](../interfaces/GamesApiResponse.md)\<[`GamePickRound`](../interfaces/GamePickRound.md)\>\>

***
