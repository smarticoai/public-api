# Interface: TUserProfile

TUser describes the information of the user
The user object is returned by _smartico.api.getUserProfile() method.
If you want to track the changes of the user profile, you can subscribe to the callback in the following way
 _smartico.on('props_change', () => console.log(_smartico.api.getUserProfile()) );

## Properties

### core\_user\_language

> **core\_user\_language**: `string`

Language code stored server-side for the user (e.g. `"en"`, `"de"`).

***

### ach\_points\_balance

> **ach\_points\_balance**: `number`

Current spendable points balance — decremented by store purchases,
tournament buy-ins, and clan entry fees.

***

### ach\_points\_ever

> **ach\_points\_ever**: `number`

All-time cumulative points earned. Monotonic — NOT decremented by
store purchases or clan/tournament fees.

***

### ach\_gems\_balance

> **ach\_gems\_balance**: `number`

Current gems balance (secondary currency).

***

### ach\_diamonds\_balance

> **ach\_diamonds\_balance**: `number`

Current diamonds balance (tertiary currency).

***

### core\_public\_tags

> **core\_public\_tags**: `string`[]

Server-stored public tags on the user (uppercase strings).
Modify via `_smartico.updatePublicTags(operation, tags)`.

***

### ach\_level\_current\_id?

> `optional` **ach\_level\_current\_id?**: `number`

FK into the level ladder; resolve via `getCurrentLevel()` or `getLevels()`.

***

### core\_is\_test\_account?

> `optional` **core\_is\_test\_account?**: `boolean`

`true` when the user is flagged as a test account.

***

### avatar\_url?

> `optional` **avatar\_url?**: `string`

Resolved CDN URL for the user's avatar.

***

### public\_username?

> `optional` **public\_username?**: `string`

Display username (operator-defined alias).

***

### core\_inbox\_unread\_count?

> `optional` **core\_inbox\_unread\_count?**: `number`

Unread inbox messages count. Push-updated in real time.

***

### core\_recommended\_deposit\_amount?

> `optional` **core\_recommended\_deposit\_amount?**: `number`

AI-recommended deposit amount for this user. Undefined when no
recommendation is currently available.

***

### core\_recommended\_casino\_bet\_amount?

> `optional` **core\_recommended\_casino\_bet\_amount?**: `number`

AI-recommended casino bet amount for this user. Undefined when no
recommendation is currently available.

***

### ach\_level\_current?

> `optional` **ach\_level\_current?**: `string`

Display name of the user's current level (e.g. `"Silver"`); resolve the id via `getCurrentLevel()`.

***

### ach\_gamification\_in\_control\_group?

> `optional` **ach\_gamification\_in\_control\_group?**: `boolean`

`true` when the user is in the gamification A/B control group (gamification UI suppressed).

***

### user\_id?

> `optional` **user\_id?**: `number`

Smartico-internal numeric user id.

***

### user\_country?

> `optional` **user\_country?**: `string`

ISO country code of the user (e.g. `"BG"`).

***

### core\_wallet\_currency?

> `optional` **core\_wallet\_currency?**: `string`

Wallet currency code (e.g. `"EUR"`).

***

### core\_registration\_date?

> `optional` **core\_registration\_date?**: `number`

Registration timestamp (epoch ms); `0` when unknown.

***

### user\_last\_session\_push\_state?

> `optional` **user\_last\_session\_push\_state?**: `string`

Last-session browser push-permission state (e.g. `"BLOCKED"`, `"GRANTED"`).

***

### acc\_bonus\_abuser?

> `optional` **acc\_bonus\_abuser?**: `boolean`

`true` when the account is flagged as a bonus abuser.

***

### avatar\_id?

> `optional` **avatar\_id?**: `string`

Selected avatar id (catalogue avatar or AI-variant base).

***

### avatar\_real\_id?

> `optional` **avatar\_real\_id?**: `number`

`avatar_real_id` of the selected avatar; `0` when none.

***

### core\_avatar\_real\_id?

> `optional` **core\_avatar\_real\_id?**: `number`

`avatar_real_id` of the user's core avatar; null when unset.

***

### core\_clan\_id?

> `optional` **core\_clan\_id?**: `string`

Current clan id (string); empty/null when not in a clan.

***

### core\_clan\_is\_kicked?

> `optional` **core\_clan\_is\_kicked?**: `boolean`

`true` when the user was kicked from their clan; null when not applicable.

***

### core\_clan\_kicked\_out\_id?

> `optional` **core\_clan\_kicked\_out\_id?**: `number`

Id of the clan the user was kicked from; null when not applicable.

***

### aff\_referred\_by\_friend\_ext\_user\_id?

> `optional` **aff\_referred\_by\_friend\_ext\_user\_id?**: `string`

ext_user_id of the friend who referred this user; null when none.

***

### aff\_refer\_friend\_url?

> `optional` **aff\_refer\_friend\_url?**: `string`

Refer-a-friend share URL; null when the feature is disabled.

***

### aff\_refered\_friends\_count?

> `optional` **aff\_refered\_friends\_count?**: `number`

Count of friends this user has referred.
