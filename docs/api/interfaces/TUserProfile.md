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
