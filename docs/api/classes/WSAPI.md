# Class: WSAPI

## Methods

### getUserProfile()

> **getUserProfile**(): [`TUserProfile`](../interfaces/TUserProfile.md)

Returns information about current user
Pay attention that this method is synchronous and returns the user profile object immediately, not a promise.
**Example**:
```
var p = _smartico.api.getUserProfile();
console.log(p);
```
**Visitor mode: not supported**

#### Returns

[`TUserProfile`](../interfaces/TUserProfile.md)

***

### checkSegmentMatch()

> **checkSegmentMatch**(`segment_id`): `Promise`\<`boolean`\>

Check if user belongs to specific segments
**Example**:
```
_smartico.api.checkSegmentMatch(1).then((result) => {
  console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### segment\_id

`number`

#### Returns

`Promise`\<`boolean`\>

***

### checkSegmentListMatch()

> **checkSegmentListMatch**(`segment_ids`): `Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

Check if user belongs to specific list of segments
**Example**:
```
_smartico.api.checkSegmentListMatch([1, 2, 3]).then((result) => {
   console.log(result);
});
```
**Visitor mode: not supported**

#### Parameters

##### segment\_ids

`number`[]

#### Returns

`Promise`\<[`TSegmentCheckResult`](../interfaces/TSegmentCheckResult.md)[]\>

***

### getLevels()

> **getLevels**(): `Promise`\<[`TLevel`](../interfaces/TLevel.md)[]\>

Returns all the levels available to the current user
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

***

### getCurrentLevel()

> **getCurrentLevel**(): `Promise`\<[`TLevelCurrent`](../interfaces/TLevelCurrent.md)\>

Returns the current level of the user with extended information including ordinal position and progress.

**Example**:
```
_smartico.api.getCurrentLevel().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TLevelCurrent`](../interfaces/TLevelCurrent.md)\>

***

### getMissions()

> **getMissions**(`__namedParameters?`): `Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the missions configured for the current user (server-side scoped, not filtered by Widget visibility).
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

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

***

### getBadges()

> **getBadges**(): `Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

Returns all the badges available to the current user

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TMissionOrBadge`](../interfaces/TMissionOrBadge.md)[]\>

***

### getBonuses()

> **getBonuses**(`__namedParameters?`): `Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

Returns all the bonuses for the current user
The returned bonuses are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getBonuses with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on bonus claimed and the updated bonuses will be passed to it.

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TBonus`](../interfaces/TBonus.md)[]\>

***

### claimBonus()

> **claimBonus**(`bonus_id`): `Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

Claim the bonus by bonus_id. Returns the err_code in case of success or error.
Note that this method can be used only on integrations where originally failed bonus can be claimed again.
For example, user won a bonus in the mini-game, but Operator rejected this bonus.
This bonus will be available for the user to claim again.

**Visitor mode: not supported**

#### Parameters

##### bonus\_id

`number`

#### Returns

`Promise`\<[`TClaimBonusResult`](../interfaces/TClaimBonusResult.md)\>

***

### getUserLevelExtraCounters()

> **getUserLevelExtraCounters**(): `Promise`\<[`UserLevelExtraCountersT`](../interfaces/UserLevelExtraCountersT.md)\>

Returns the extra counters for the current user level.
These are counters that are configured for each Smartico client separately by request.
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

***

### getStoreItems()

> **getStoreItems**(`params?`): `Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns all the store items available to the current user
The returned store items are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getStoreItems with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on purchase of the store item.

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

#### Parameters

##### params?

###### onUpdate?

(`data`) => `void`

callback function that will be called when the store items are updated

#### Returns

`Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

***

### buyStoreItem()

> **buyStoreItem**(`item_id`): `Promise`\<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

Buy the specific shop item by item_id. Returns the err_code in case of success or error.
**Example**:
```
_smartico.api.buyStoreItem(1).then((result) => {
    console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### item\_id

`number`

#### Returns

`Promise`\<[`TBuyStoreItemResult`](../interfaces/TBuyStoreItemResult.md)\>

***

### getStoreCategories()

> **getStoreCategories**(): `Promise`\<[`TStoreCategory`](../interfaces/TStoreCategory.md)[]\>

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

***

### getStorePurchasedItems()

> **getStorePurchasedItems**(`__namedParameters?`): `Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

Returns purchased items based on the provided parameters. "Limit" and "offset" indicate the range of items to be fetched.
The maximum number of items per request is limited to 20.
You can leave this params empty and by default it will return list of purchased items ranging from 0 to 20.
The returned store items are cached for 30 seconds. But you can pass the onUpdate callback as a parameter.
Note that each time you call getStorePurchasedItems with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on purchase of the store item and the last 20 items will be passed to it.

**Example**:
```
_smartico.api.getStorePurchasedItems().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters?

###### limit?

`number`

###### offset?

`number`

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TStoreItem`](../interfaces/TStoreItem.md)[]\>

***

### getAchCategories()

> **getAchCategories**(): `Promise`\<[`TAchCategory`](../interfaces/TAchCategory.md)[]\>

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

***

### getCustomSections()

> **getCustomSections**(): `Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

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

***

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

### requestMissionOptIn()

> **requestMissionOptIn**(`mission_id`): `Promise`\<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

Requests an opt-in for the specified mission_id. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

##### mission\_id

`number`

#### Returns

`Promise`\<[`TMissionOptInResult`](../interfaces/TMissionOptInResult.md)\>

***

### requestMissionClaimReward()

> **requestMissionClaimReward**(`mission_id`, `ach_completed_id`): `Promise`\<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

Request for claim reward for the specified mission id. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

##### mission\_id

`number`

##### ach\_completed\_id

`number`

#### Returns

`Promise`\<[`TMissionClaimRewardResult`](../interfaces/TMissionClaimRewardResult.md)\>

***

### getTournamentsList()

> **getTournamentsList**(`__namedParameters?`): `Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

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

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TTournament`](../interfaces/TTournament.md)[]\>

***

### getClans()

> **getClans**(`__namedParameters?`): `Promise`\<[`TClans`](../interfaces/TClans.md)\>

Returns clans list payload for the current user.
The returned payload is cached for 30 seconds.
If onUpdate is passed, it will be called when clans response is received.

**Visitor mode: not supported**

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TClans`](../interfaces/TClans.md)\>

***

### getClanInfo()

> **getClanInfo**(`clanId`): `Promise`\<[`TClanInfo`](../interfaces/TClanInfo.md)\>

Returns detailed information for a specific clan including its members.

**Visitor mode: not supported**

#### Parameters

##### clanId

`number`

#### Returns

`Promise`\<[`TClanInfo`](../interfaces/TClanInfo.md)\>

***

### joinClan()

> **joinClan**(`clanId`): `Promise`\<[`TClanJoinResult`](../interfaces/TClanJoinResult.md)\>

Joins a clan on behalf of the current user.

**Visitor mode: not supported**

#### Parameters

##### clanId

`number`

#### Returns

`Promise`\<[`TClanJoinResult`](../interfaces/TClanJoinResult.md)\>

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

### getInboxMessages()

> **getInboxMessages**(`params?`): `Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

Returns inbox messages based on the provided parameters. "From" and "to" indicate the range of messages to be fetched.
The maximum number of messages per request is limited to 20. 
An indicator "onlyFavorite" can be passed to get only messages marked as favorites.
An indicator "read_status" can be passed to get only messages marked as read or unread.
You can leave this params empty and by default it will return list of messages ranging from 0 to 20.
This function returns a list of messages without the body of each message.
To get the body of the message you need to call getInboxMessageBody function and pass the message guid contained in each message of this request.
All other action like mark as read, favorite, delete, etc. can be done using this message GUID.
The "onUpdate" callback will be triggered when the user receives a new message. It will provide an updated list of messages, ranging from 0 to 20, to the onUpdate callback function.

**Visitor mode: not supported**

#### Parameters

##### params?

###### from?

`number`

###### to?

`number`

###### onlyFavorite?

`boolean`

###### categoryId?

[`InboxCategories`](../enumerations/InboxCategories.md)

###### read_status?

[`InboxReadStatus`](../enumerations/InboxReadStatus.md)

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TInboxMessage`](../interfaces/TInboxMessage.md)[]\>

***

### getInboxUnreadCount()

> **getInboxUnreadCount**(`params?`): `Promise`\<`number`\>

Returns inbox unread count.

**Visitor mode: not supported**

#### Parameters

##### params?

###### onUpdate?

(`unread_count`) => `void`

#### Returns

`Promise`\<`number`\>

***

### getInboxMessageBody()

> **getInboxMessageBody**(`messageGuid`): `Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

Returns the message body of the specified message guid.

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`TInboxMessageBody`](../interfaces/TInboxMessageBody.md)\>

***

### markInboxMessageAsRead()

> **markInboxMessageAsRead**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as read

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### markAllInboxMessagesAsRead()

> **markAllInboxMessagesAsRead**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark all inbox messages as read

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### markUnmarkInboxMessageAsFavorite()

> **markUnmarkInboxMessageAsFavorite**(`messageGuid`, `mark`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to mark inbox message with specified guid as favorite. Pass mark true to add message to favorite and false to remove.

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

##### mark

`boolean`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### deleteInboxMessage()

> **deleteInboxMessage**(`messageGuid`): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete inbox message

**Visitor mode: not supported**

#### Parameters

##### messageGuid

`string`

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### deleteAllInboxMessages()

> **deleteAllInboxMessages**(): `Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

Requests to delete all inbox messages

**Visitor mode: not supported**

#### Returns

`Promise`\<[`InboxMarkMessageAction`](../interfaces/InboxMarkMessageAction.md)\>

***

### getTranslations()

> **getTranslations**(`lang_code`): `Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.

#### Parameters

##### lang\_code

`string`

#### Returns

`Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

***

### reportImpressionEvent()

> **reportImpressionEvent**(`params`): `void`

Reports an impression event for an engagement (when engagement content is displayed to the user).
Use this method to track when users view engagement content such as inbox messages, popups.
When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType.

**Example**:
```
_smartico.api.reportImpressionEvent({
     engagement_uid: 'abc123-def456',
     activityType: 31 // Inbox
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Event parameters

###### engagement_uid

`string`

Unique identifier for the engagement

###### activityType

`number`

Type of engagement activity (Popup=30, Inbox=31)

#### Returns

`void`

***

### reportClickEvent()

> **reportClickEvent**(`params`): `void`

Reports a click/action event for an engagement (when user interacts with engagement content).
Use this method to track when users click on or interact with engagement content such as inbox messages, popups.
When using for Inbox cases, you need to use message guid as engagement_uid, and pass 31 as activityType, and pass the action/deeplink that was triggered by the user interaction as action.

**Example**:
```
_smartico.api.reportClickEvent({
     engagement_uid: 'abc123-def456',
     activityType: 31 // Inbox
     action: 'dp:gf_missions'
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Event parameters

###### engagement_uid

`string`

Unique identifier for the engagement

###### activityType

`number`

Type of engagement activity (Popup=30, Inbox=31)

###### action?

`string`

Optional action/deeplink that was triggered by the user interaction

#### Returns

`void`

***

### getActivityLog()

> **getActivityLog**(`params`): `Promise`\<[`TActivityLog`](../interfaces/TActivityLog.md)[]\>

Returns the activity log for a user within a specified time range.
The response includes both points changes and gems/diamonds changes.
Each log entry contains information about the change amount, balance, and source.
The returned list is cached for 30 seconds. 
You can pass the onUpdate callback as a parameter, it will be called every time the activity log is updated and will provide the updated list of activity logs for the last 10 minutes.

**Example**:
```
const startTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
const endTime = Math.floor(Date.now() / 1000); // now

_smartico.api.getActivityLog({
     startTimeSeconds: startTime,
     endTimeSeconds: endTime,
     from: 0,
     to: 50,
     onUpdate: (data) => console.log('Updated:', data)
}).then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Parameters

##### params

Activity log parameters

###### startTimeSeconds

`number`

Start time in seconds (epoch timestamp)

###### endTimeSeconds

`number`

End time in seconds (epoch timestamp)

###### from

`number`

Start index of records to return

###### to

`number`

End index of records to return

###### onUpdate?

(`data`) => `void`

Optional callback function that will be called when the activity log is updated

#### Returns

`Promise`\<[`TActivityLog`](../interfaces/TActivityLog.md)[]\>

***

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

### getAvatarsList()

> **getAvatarsList**(): `Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

Returns the list of avatars available in the catalog for the current user.
The response includes both free avatars and earned/purchased ones.
Avatars with `hide_until_achieved = true` and `is_given = false` should be hidden from the user.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarsList().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

***

### getAvatarsCustomized()

> **getAvatarsCustomized**(): `Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

Returns the list of AI-customized avatars for the current user.
Each entry represents a previously generated AI customization for a specific base avatar.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarsCustomized().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

***

### getAvatarPrompts()

> **getAvatarPrompts**(): `Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

Returns the list of AI customization prompts (styles) available for avatar customization.
Each prompt represents a visual style that can be applied to a base avatar.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarPrompts().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

***

### setAvatar()

> **setAvatar**(`props`): `Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

Sets the specified avatar as the active avatar for the current user.
Pass `avatar_url` (the `TAvatarDefinition.url` path or a CDN URL for AI-customized avatars)
and `avatar_real_id` from the avatar catalog.
After a successful call, the avatar list cache is cleared so the next `getAvatarsList()` call reflects `is_in_use`.

**Example**:
```
_smartico.api.getAvatarsList().then((avatars) => {
     const avatar = avatars.find((a) => !a.hide_until_achieved || a.is_given);
     if (avatar) {
         _smartico.api.setAvatar({
             avatar_url: avatar.url,
             avatar_real_id: avatar.avatar_real_id,
         }).then((result) => {
             console.log(result);
         });
     }
});
```

**Visitor mode: not supported**

#### Parameters

##### props

###### avatar_url

`string`

###### avatar_real_id

`number`

#### Returns

`Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

***

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

### getRelatedItemsForGame()

> **getRelatedItemsForGame**(`related_game_id`): `Promise`\<[`GetRelatedAchTourResponse`](../interfaces/GetRelatedAchTourResponse.md)\>

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

##### related\_game\_id

`string`

#### Returns

`Promise`\<[`GetRelatedAchTourResponse`](../interfaces/GetRelatedAchTourResponse.md)\>

***

### getRaffles()

> **getRaffles**(`__namedParameters?`): `Promise`\<[`TRaffle`](../interfaces/TRaffle.md)[]\>

Returns the list of Raffles available for user
The returned list of Raffles is cached for 30 seconds. But you can pass the onUpdate callback as a parameter. Note that each time you call getRaffles with a new onUpdate callback, the old one will be overwritten by the new one.
The onUpdate callback will be called on claiming prize.  Updated Raffles will be passed to onUpdate callback.

**Example**:

```
_smartico.api.getRaffles().then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```
_smartico.vapi('EN').getRaffles().then((result) => {
     console.log(result);
});
```

#### Parameters

##### \_\_namedParameters?

###### onUpdate?

(`data`) => `void`

#### Returns

`Promise`\<[`TRaffle`](../interfaces/TRaffle.md)[]\>

***

### getRaffleDrawRun()

> **getRaffleDrawRun**(`props`): `Promise`\<[`TRaffleDraw`](../interfaces/TRaffleDraw.md)\>

Returns draw run for provided raffle_id and run_id.
You can pass winners_from and winners_to parameters to get a specific range of winners. Default is 0-20.

**Example**:

```javascript
_smartico.api.getRaffleDrawRun({raffle_id: 156, run_id: 145}).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').getRaffleDrawRun({ raffle_id: 156, run_id: 145 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### raffle_id

`number`

###### run_id

`number`

###### winners_from?

`number`

###### winners_to?

`number`

#### Returns

`Promise`\<[`TRaffleDraw`](../interfaces/TRaffleDraw.md)\>

***

### getRaffleDrawRunsHistory()

> **getRaffleDrawRunsHistory**(`props`): `Promise`\<[`TRaffleDrawRun`](../interfaces/TRaffleDrawRun.md)[]\>

Returns history of draw runs for the provided raffle_id and draw_id, if the draw_id is not provided will return history of all the draws for the provided raffle_id

**Example**:

```javascript
_smartico.api.getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').getRaffleDrawRunsHistory({ raffle_id: 156, draw_id: 432 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### raffle_id

`number`

###### draw_id?

`number`

#### Returns

`Promise`\<[`TRaffleDrawRun`](../interfaces/TRaffleDrawRun.md)[]\>

***

### claimRafflePrize()

> **claimRafflePrize**(`props`): `Promise`\<[`TransformedRaffleClaimPrizeResponse`](../interfaces/TransformedRaffleClaimPrizeResponse.md)\>

Returns `err_code` and `err_message` after the call; `err_code` 0 means the request succeeded.

**Example**:

```javascript
_smartico.api.claimRafflePrize({won_id:251}).then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:

```javascript
_smartico.vapi('EN').claimRafflePrize({ won_id: 251 }).then((result) => {
     console.log(result);
});
```

#### Parameters

##### props

###### won_id

`number`

#### Returns

`Promise`\<[`TransformedRaffleClaimPrizeResponse`](../interfaces/TransformedRaffleClaimPrizeResponse.md)\>

***

### requestRaffleOptin()

> **requestRaffleOptin**(`props`): `Promise`\<[`TRaffleOptinResponse`](../interfaces/TRaffleOptinResponse.md)\>

Requests an opt-in for the specified raffle. Returns the err_code.

**Visitor mode: not supported**

#### Parameters

##### props

###### raffle_id

`number`

###### draw_id

`number`

###### raffle_run_id

`number`

#### Returns

`Promise`\<[`TRaffleOptinResponse`](../interfaces/TRaffleOptinResponse.md)\>
