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

### getUserLevelExtraCounters

▸ **getUserLevelExtraCounters**(): `Promise`<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

Returns the extra counters for the current user level

#### Returns

`Promise`<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

___

### getStoreItems

▸ **getStoreItems**(): `Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns all the store items available the current user

#### Returns

`Promise`<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

___

### buyStoreItem

▸ **buyStoreItem**(`item_id`): `Promise`<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

Buy the specific shop item by item_id. Returns the err_code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item_id` | `number` |

#### Returns

`Promise`<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

___

### getStoreCategories

▸ **getStoreCategories**(): `Promise`<[`TStoreCategory`](../interfaces/TStoreCategory.md)[]\>

Returns store categories

#### Returns

`Promise`<[`TStoreCategory`](../interfaces/TStoreCategory.md)[]\>

___

### getAchCategories

▸ **getAchCategories**(): `Promise`<[`TAchCategory`](../interfaces/TAchCategory.md)[]\>

Returns ach categories

#### Returns

`Promise`<[`TAchCategory`](../interfaces/TAchCategory.md)[]\>

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

### requestMissionClaimReward

▸ **requestMissionClaimReward**(`mission_id`, `ach_completed_id`): `Promise`<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

Requests a claim reward for the specified mission_id. Returns the err_code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mission_id` | `number` |
| `ach_completed_id` | `number` |

#### Returns

`Promise`<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

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

Returns details information of specific tournament instance, the response will include tournament info and the leaderboard of players

#### Parameters

| Name | Type |
| :------ | :------ |
| `tournamentInstanceId` | `number` |

#### Returns

`Promise`<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

___

### registerInTournament

▸ **registerInTournament**(`tournamentInstanceId`): `Promise`<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

Requests registration for the specified tournament instance. Returns the err_code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `tournamentInstanceId` | `number` |

#### Returns

`Promise`<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

___

### getLeaderBoard

▸ **getLeaderBoard**(`periodType`, `getPreviousPeriod?`): `Promise`<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

Returns the leaderboard for the current type (default is Daily). If getPreviousPeriod is passed as true, a leaderboard for the previous period for the current type will be returned.
For example, if the type is Weekly and getPreviousPeriod is true, a leaderboard for the previous week will be returned.

#### Parameters

| Name | Type |
| :------ | :------ |
| `periodType` | `LeaderBoardPeriodType` |
| `getPreviousPeriod?` | `boolean` |

#### Returns

`Promise`<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

___

### getInboxMessages

▸ **getInboxMessages**(`params?`): `Promise`<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.from?` | `number` |
| `params.to?` | `number` |
| `params.onlyFavorite?` | `boolean` |
| `params.onUpdate?` | (`data`: [`TInboxMessage`](../interfaces/TInboxMessage.md)[]) => `void` |

#### Returns

`Promise`<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

___

### getInboxMessageBody

▸ **getInboxMessageBody**(`messageGuid`): `Promise`<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

Returns the message body of the specified message guid.

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

___

### markInboxMessageAsRead

▸ **markInboxMessageAsRead**(`messageGuid`): `Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as read

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### markAllInboxMessagesAsRead

▸ **markAllInboxMessagesAsRead**(): `Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark all inbox messages as read

#### Returns

`Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### markUnmarkInboxMessageAsFavorite

▸ **markUnmarkInboxMessageAsFavorite**(`messageGuid`, `mark`): `Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as favorite. Pass mark true to add message to favorite and false to remove.

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |
| `mark` | `boolean` |

#### Returns

`Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### deleteInboxMessage

▸ **deleteInboxMessage**(`messageGuid`): `Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete inbox message

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### deleteAllInboxMessages

▸ **deleteAllInboxMessages**(): `Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete all inbox messages

#### Returns

`Promise`<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### getTranslations

▸ **getTranslations**(`lang_code`): `Promise`<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.

#### Parameters

| Name | Type |
| :------ | :------ |
| `lang_code` | `string` |

#### Returns

`Promise`<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>
