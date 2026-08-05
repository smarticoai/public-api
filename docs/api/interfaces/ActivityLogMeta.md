# Interface: ActivityLogMeta

Extra display payload attached to an activity-log row (`ctx_meta` on the wire).
Which keys are present depends on the row's activity type — treat every field
as optional and render only what is there.

## Properties

### name?

> `optional` **name?**: `string`

Display name of the source entity (mission, tournament, raffle, …).

***

### image\_url?

> `optional` **image\_url?**: `string`

***

### position?

> `optional` **position?**: `number`

***

### user\_points\_balance\_before?

> `optional` **user\_points\_balance\_before?**: `number`

Points balance before this row; points rows.

***

### points\_requested?

> `optional` **points\_requested?**: `number`

Points the awarding rule asked for; points rows.

***

### user\_points\_ever?

> `optional` **user\_points\_ever?**: `number`

Total points ever collected after this row; points rows.

***

### amount\_requested?

> `optional` **amount\_requested?**: `number`

Gems / diamonds the awarding rule asked for; gems / diamonds rows.

***

### balance\_before?

> `optional` **balance\_before?**: `number`

Gems / diamonds balance before this row.

***

### affects\_level?

> `optional` **affects\_level?**: `boolean`

Whether this row counts toward level progress.

***

### affects\_leaderboard?

> `optional` **affects\_leaderboard?**: `boolean`

Whether this row counts toward leaderboards.

***

### affects\_current\_balance?

> `optional` **affects\_current\_balance?**: `boolean`

Whether this row moved the spendable balance.

***

### user\_initialization?

> `optional` **user\_initialization?**: `boolean`

Set on the row that seeds a brand-new user's wallet.

***

### is\_recurring?

> `optional` **is\_recurring?**: `boolean`

Set on mission rows for repeatable missions.

***

### from\_level\_id?

> `optional` **from\_level\_id?**: `number`

Level moved from; level-change rows.

***

### to\_level\_id?

> `optional` **to\_level\_id?**: `number`

Level moved to; level-change rows.

***

### from\_level\_public\_meta?

> `optional` **from\_level\_public\_meta?**: `any`

Public meta of the level moved from; level-change rows.

***

### to\_level\_public\_meta?

> `optional` **to\_level\_public\_meta?**: `any`

Public meta of the level moved to; level-change rows.
