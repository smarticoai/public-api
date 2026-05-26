# Class: WSAPIGeneral
## Methods

### getUserProfile()

> **getUserProfile**(): [`TUserProfile`](../interfaces/TUserProfile.md)

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

### getCustomSections()

> **getCustomSections**(): `Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

#### Returns

`Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

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
