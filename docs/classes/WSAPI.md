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

▸ **getMissions**(`params?`): `Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.onUpdate?` | (`data`: [`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]) => `void` |

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

▸ **getMiniGames**(`params?`): `Promise`<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

/**
 *

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.onUpdate?` | (`data`: [`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]) => `void` |

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

### requestMissionOptIn

▸ **requestMissionOptIn**(`mission_id`): `Promise`<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

Requests an opt-in for the specified mission_id. Returns the err_code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mission_id` | `number` |

#### Returns

`Promise`<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

___

### getTournamentsList

▸ **getTournamentsList**(`params?`): `Promise`<[`TTournament`](../interfaces/TTournament.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.onUpdate?` | (`data`: [`TTournament`](../interfaces/TTournament.md)[]) => `void` |

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
