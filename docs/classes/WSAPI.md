# Class: WSAPI

## Methods

### getUserProfile

▸ **getUserProfile**(): [`TUserProfile`](../interfaces/TUserProfile.md)

Returns information about current user

#### Returns

[`TUserProfile`](../interfaces/TUserProfile.md)

___

### getLevels

▸ **getLevels**(): `Promise`<[`TLevel`](../interfaces/TLevel.md)[]\>

Returns all the levels available the current user

#### Returns

`Promise`<[`TLevel`](../interfaces/TLevel.md)[]\>

___

### getMissions

▸ **getMissions**(): `Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the missions available the current user

#### Returns

`Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

___

### getBadges

▸ **getBadges**(): `Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the badges available the current user

#### Returns

`Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

___

### getStoreItems

▸ **getStoreItems**(): `Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns all the store items available the current user

#### Returns

`Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

___

### getStoreCategories

▸ **getStoreCategories**(): `Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns store categories

#### Returns

`Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

___

### getMiniGames

▸ **getMiniGames**(): `Promise`<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Returns the list of mini-games available for user

#### Returns

`Promise`<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

___

### playMiniGame

▸ **playMiniGame**(`template_id`): `Promise`<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code

#### Parameters

| Name | Type |
| :------ | :------ |
| `template_id` | `number` |

#### Returns

`Promise`<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

___

### getTournamentsList

▸ **getTournamentsList**(): `Promise`<[`TTournament`](../interfaces/TTournament.md)[]\>

Returns all the active instances of tournaments

#### Returns

`Promise`<[`TTournament`](../interfaces/TTournament.md)[]\>

___

### getTournamentInstanceInfo

▸ **getTournamentInstanceInfo**(`tournamentInstanceId`): `Promise`<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

Returns details information of specific tournament instance, the response will includ tournamnet info and the leaderboard of players

#### Parameters

| Name | Type |
| :------ | :------ |
| `tournamentInstanceId` | `number` |

#### Returns

`Promise`<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>
