# Class: WSAPIUser
## Methods

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
