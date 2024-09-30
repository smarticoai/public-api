# Class: WSAPI

## Methods

### getUserProfile

▸ **getUserProfile**(): [`TUserProfile`](../interfaces/TUserProfile.md)

Returns information about current user

**Example**:
```
_smartico.api.getUserProfile().then((result) => {
 console.log(result);
});
```
**Visitor mode: not supported**

#### Returns

[`TUserProfile`](../interfaces/TUserProfile.md)

___

### checkSegmentMatch

▸ **checkSegmentMatch**(`segment_id`): `Promise`\<`boolean`\>

Check if user belongs to specific segments
**Example**:
```
_smartico.api.checkSegmentMatch(1).then((result) => {
  console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment_id` | `number` |

#### Returns

`Promise`\<`boolean`\>

___

### checkSegmentListMatch

▸ **checkSegmentListMatch**(`segment_ids`): `Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

Check if user belongs to specific list of segments
**Example**:
```
_smartico.api.checkSegmentListMatch([1, 2, 3]).then((result) => {
   console.log(result);
});
```
**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment_ids` | `number`[] |

#### Returns

`Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

___

### getLevels

▸ **getLevels**(): `Promise`\<[`TLevel`](../interfaces/TLevel.md)[]\>

Returns all the levels available the current user
**Example**:
```
_smartico.api.getLevels().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getLevels().then((result) => {
     console.log(result);
});
```

#### Returns

`Promise`\<[`TLevel`](../interfaces/TLevel.md)[]\>

___

### getMissions

▸ **getMissions**(`«destructured»?`): `Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the missions available the current user.
The returned missions are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getMissions with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on mission OptIn and the updated missions will be passed to it.

**Example**:
```
_smartico.api.getMissions().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getMissions().then((result) => {
     console.log(result);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]) => `void` |

#### Returns

`Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

___

### getBadges

▸ **getBadges**(): `Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the badges available the current user

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

___

### getBonuses

▸ **getBonuses**(`«destructured»?`): `Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

Returns all the bonuses for the current user
The returned bonuss are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TBonus`](../interfaces/TBonus.md)[]) => `void` |

#### Returns

`Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

___

### claimBonus

▸ **claimBonus**(`bonus_id`): `Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

Claim the bonus by bonus_id. Returns the err_code in case of success or error.
Note that this method can be used only on integrations where originally failed bonus can be claimed again.
For example, user won a bonus in the mini-game, but Operator rejected this bonus. 
This bonus will be available for the user to claim again.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `bonus_id` | `number` |

#### Returns

`Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

___

### getUserLevelExtraCounters

▸ **getUserLevelExtraCounters**(): `Promise`\<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

Returns the extra counters for the current user level.
These are counters that are configured for each Smartico client separatly by request.
For example 1st counter could be total wagering amount, 2nd counter could be total deposit amount, etc.

**Example**:
```
_smartico.api.getUserLevelExtraCounters().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

___

### getStoreItems

▸ **getStoreItems**(): `Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns all the store items available the current user

**Example**:
```
_smartico.api.getStoreItems().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getStoreItems().then((result) => {
     console.log(result);
});
```

#### Returns

`Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

___

### buyStoreItem

▸ **buyStoreItem**(`item_id`): `Promise`\<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

Buy the specific shop item by item_id. Returns the err_code in case of success or error.
**Example**:
```
_smartico.api.buyStoreItem(1).then((result) => {
    console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `item_id` | `number` |

#### Returns

`Promise`\<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

___

### getStoreCategories

▸ **getStoreCategories**(): `Promise`\<[`TStoreCategory`](../interfaces/TStoreCategory.md)[]\>

Returns store categories

**Example**:
```
_smartico.api.getStoreCategories().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getStoreCategories().then((result) => {
     console.log(result);
});
```

#### Returns

`Promise`\<[`TStoreCategory`](../interfaces/TStoreCategory.md)[]\>

___

### getStorePurchasedItems

▸ **getStorePurchasedItems**(`«destructured»?`): `Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns purchased items based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
The maximum number of items per request is limited to 20.
You can leave this params empty and by default it will return list of purchased items ranging from 0 to 20.

**Example**:
```
_smartico.api.getStorePurchasedItems().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `limit?` | `number` |
| › `offset?` | `number` |
| › `onUpdate?` | (`data`: [`TStoreItem`](../interfaces/TStoreItem.md)[]) => `void` |

#### Returns

`Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

___

### getAchCategories

▸ **getAchCategories**(): `Promise`\<[`TAchCategory`](../interfaces/TAchCategory.md)[]\>

Returns missions & badges categories

**Example**:
```
_smartico.api.getAchCategories().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getAchCategories().then((result) => {
     console.log(result);
});
```

#### Returns

`Promise`\<[`TAchCategory`](../interfaces/TAchCategory.md)[]\>

___

### getCustomSections

▸ **getCustomSections**(): `Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

Returns list of custom sections

**Example**:
```
_smartico.api.getCustomSections().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getCustomSections().then((result) => {
     console.log(result);
});
```

#### Returns

`Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

___

### getMiniGames

▸ **getMiniGames**(`«destructured»?`): `Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

Returns the list of mini-games available for user
The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGames with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

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

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]) => `void` |

#### Returns

`Promise`\<[`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]\>

___

### getMiniGamesHistory

▸ **getMiniGamesHistory**(`«destructured»?`): `Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

Returns the list of mini-games based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
The maximum number of items per request is limited to 20.
You can leave this params empty and by default it will return list of mini-games ranging from 0 to 20.
The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getMiniGamesHistory with a new onUpdate callback, the old one will be overwritten by the new one.
Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.getMiniGamesHistory().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `limit?` | `number` |
| › `offset?` | `number` |
| › `saw_template_id?` | `number` |
| › `onUpdate?` | (`data`: [`TMiniGameTemplate`](../interfaces/TMiniGameTemplate.md)[]) => `void` |

#### Returns

`Promise`\<[`TSawHistory`](../interfaces/TSawHistory.md)[]\>

___


### playMiniGame

▸ **playMiniGame**(`template_id`, `«destructured»?`): `Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

Plays the specified by template_id mini-game on behalf of user and returns prize_id or err_code
 * After playMiniGame is called, you can call getMiniGames to get the list of mini-games.The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGame with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.playMiniGame(55).then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `template_id` | `number` |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]) => `void` |

#### Returns

`Promise`\<[`TMiniGamePlayResult`](../interfaces/TMiniGamePlayResult.md)\>

___

### playMiniGameBatch

▸ **playMiniGameBatch**(`template_id`, `spin_count`, `«destructured»?`): `Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

Plays the specified by template_id mini-game on behalf of user spin_count times and returns array of the prizes
After playMiniGameBatch is called, you can call getMiniGames to get the list of mini-games. The returned list of mini-games is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call playMiniGameBatch with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on available spin count change, if mini-game has increasing jackpot per spin or wined prize is spin/jackpot and if max count of the available user spin equal one, also if the spins were issued to the user manually in the BO. Updated templates will be passed to onUpdate callback.

**Example**:
```
_smartico.api.playMiniGameBatch(55, 10).then((result) => {
     console.log(result);
});
```
**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `template_id` | `number` |
| `spin_count` | `number` |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]) => `void` |

#### Returns

`Promise`\<[`TMiniGamePlayBatchResult`](../interfaces/TMiniGamePlayBatchResult.md)[]\>

___

### requestMissionOptIn

▸ **requestMissionOptIn**(`mission_id`): `Promise`\<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

Requests an opt-in for the specified mission_id. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `mission_id` | `number` |

#### Returns

`Promise`\<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

___

### requestMissionClaimReward

▸ **requestMissionClaimReward**(`mission_id`, `ach_completed_id`): `Promise`\<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

Request for claim reward for the specified mission id. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `mission_id` | `number` |
| `ach_completed_id` | `number` |

#### Returns

`Promise`\<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

___

### getTournamentsList

▸ **getTournamentsList**(`«destructured»?`): `Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

Returns all the active instances of tournaments
The returned list is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getTournamentsList with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called when the user has registered in a tournament. Updated list will be passed to onUpdate callback.

**Example**:
```
_smartico.api.getTournamentsList().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getTournamentsList().then((result) => {
     console.log(result);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `onUpdate?` | (`data`: [`TTournament`](../interfaces/TTournament.md)[]) => `void` |

#### Returns

`Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

___

### getTournamentInstanceInfo

▸ **getTournamentInstanceInfo**(`tournamentInstanceId`): `Promise`\<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

Returns details information of specific tournament instance, the response will include tournament info and the leaderboard of players

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

| Name | Type |
| :------ | :------ |
| `tournamentInstanceId` | `number` |

#### Returns

`Promise`\<[`TTournamentDetailed`](../interfaces/TTournamentDetailed.md)\>

___

### registerInTournament

▸ **registerInTournament**(`tournamentInstanceId`): `Promise`\<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

Requests registration for the specified tournament instance. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `tournamentInstanceId` | `number` |

#### Returns

`Promise`\<[`TTournamentRegistrationResult`](../interfaces/TTournamentRegistrationResult.md)\>

___

### getLeaderBoard

▸ **getLeaderBoard**(`periodType`, `getPreviousPeriod?`): `Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

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

| Name | Type |
| :------ | :------ |
| `periodType` | [`LeaderBoardPeriodType`](../enums/LeaderBoardPeriodType.md) |
| `getPreviousPeriod?` | `boolean` |

#### Returns

`Promise`\<[`LeaderBoardDetailsT`](../interfaces/LeaderBoardDetailsT.md)\>

___

### getInboxMessages

▸ **getInboxMessages**(`params?`): `Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

Returns inbox messages based on the provided parameters. "From" and "to" indicate the range of messages to be fetched.
The maximum number of messages per request is limited to 20. An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
You can leave this params empty and by default it will return list of messages ranging from 0 to 20.
This functions return list of messages without the body of the message.
To get the body of the message you need to call getInboxMessageBody function and pass the message guid contained in each message of this request.
All other action like mark as read, favorite, delete, etc. can be done using this message GUID.
The "onUpdate" callback will be triggered when the user receives a new message. It will provide an updated list of messages, ranging from 0 to 20, to the onUpdate callback function.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.from?` | `number` |
| `params.to?` | `number` |
| `params.onlyFavorite?` | `boolean` |
| `params.onUpdate?` | (`data`: [`TInboxMessage`](../interfaces/TInboxMessage.md)[]) => `void` |

#### Returns

`Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

___

### getInboxMessageBody

▸ **getInboxMessageBody**(`messageGuid`): `Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

Returns the message body of the specified message guid.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

___

### markInboxMessageAsRead

▸ **markInboxMessageAsRead**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as read

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### markAllInboxMessagesAsRead

▸ **markAllInboxMessagesAsRead**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark all inbox messages as rea

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### markUnmarkInboxMessageAsFavorite

▸ **markUnmarkInboxMessageAsFavorite**(`messageGuid`, `mark`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as favorite. Pass mark true to add message to favorite and false to remove.

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |
| `mark` | `boolean` |

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### deleteInboxMessage

▸ **deleteInboxMessage**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete inbox message

**Visitor mode: not supported**

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageGuid` | `string` |

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### deleteAllInboxMessages

▸ **deleteAllInboxMessages**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete all inbox messages

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

___

### getTranslations

▸ **getTranslations**(`lang_code`): `Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.

#### Parameters

| Name | Type |
| :------ | :------ |
| `lang_code` | `string` |

#### Returns

`Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

___

### jackpotGet

▸ **jackpotGet**(`filter?`): `Promise`\<[`JackpotDetails`](../interfaces/JackpotDetails.md)[]\>

Returns list of Jackpots that are active in the systen and matching to the filter definition.
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

| Name | Type |
| :------ | :------ |
| `filter?` | `Object` |
| `filter.related_game_id?` | `string` |
| `filter.jp_template_id?` | `number` |

#### Returns

`Promise`\<[`JackpotDetails`](../interfaces/JackpotDetails.md)[]\>

___

### jackpotOptIn

▸ **jackpotOptIn**(`filter`): `Promise`\<[`JackpotsOptinResponse`](../interfaces/JackpotsOptinResponse.md)\>

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

| Name | Type |
| :------ | :------ |
| `filter` | `Object` |
| `filter.jp_template_id` | `number` |

#### Returns

`Promise`\<[`JackpotsOptinResponse`](../interfaces/JackpotsOptinResponse.md)\>

___

### jackpotOptOut

▸ **jackpotOptOut**(`filter`): `Promise`\<[`JackpotsOptoutResponse`](../interfaces/JackpotsOptoutResponse.md)\>

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

| Name | Type |
| :------ | :------ |
| `filter` | `Object` |
| `filter.jp_template_id` | `number` |

#### Returns

`Promise`\<[`JackpotsOptoutResponse`](../interfaces/JackpotsOptoutResponse.md)\>

___

### getRelatedItemsForGame

▸ **getRelatedItemsForGame**(`related_game_id`): `Promise`\<`GetAchievementMapResponse`\>

Returns all the related tournaments and missions for the provided game id for the current user
The provided Game ID should correspond to the ID from the Games Catalog - https://help.smartico.ai/welcome/technical-guides/games-catalog-api

**Example**:
```
_smartico.api.getRelatedItemsForGame('gold-slot2').then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getRelatedItemsForGame('gold-slot2').then((result) => {
     console.log(result);
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `related_game_id` | `string` |

#### Returns

`Promise`\<`GetAchievementMapResponse`\>
