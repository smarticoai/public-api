# Class: WSAPIClans
## Methods

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
