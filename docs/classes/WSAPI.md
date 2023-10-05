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

▸ **getMissions**(`«destructured»?`): `Promise`<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the missions available the current user.
The returned missions is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMissions with a new onUpdate callback, the old one will be overwritten by the new one. 
The onUpdate callback will be called on mission OptIn and the updated missions will be passed to it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]) => `void` |

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

▸ **getMiniGames**(`«destructured»?`): `Promise`<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Returns the list of mini-games available for user 
The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one. 
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one. Updated templates will be passed to onUpdate callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]) => `void` |

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

▸ **getTournamentsList**(`«destructured»?`): `Promise`<[`TTournament`](../interfaces/TTournament.md)[]\>

Returns all the active instances of tournaments 
The returned list is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getTournamentsList with a new onUpdate callback, the old one will be overwritten by the new one. 
The onUpdate callback will be called when the user has registered in a tournament. Updated list will be passed to onUpdate callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TTournament`](../interfaces/TTournament.md)[]) => `void` |

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
