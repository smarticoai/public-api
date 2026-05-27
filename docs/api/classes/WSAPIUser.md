# Class: WSAPIUser
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
