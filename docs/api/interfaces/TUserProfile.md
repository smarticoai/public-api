# Interface: TUserProfile

TUser describes the information of the user
The user object is returned by _smartico.api.getUserProfile() method.
If you want to track the changes of the user profile, you can subscribe to the callback in the following way
 _smartico.on('props_change', () => console.log(_smartico.api.getUserProfile()) );

## Properties

### core\_user\_language

> **core\_user\_language**: `string`

The language of the user

***

### ach\_points\_balance

> **ach\_points\_balance**: `number`

The current points balance that user can use in the Store, Mini-games, Tournaments, etc..

***

### ach\_points\_ever

> **ach\_points\_ever**: `number`

The amount of points that user collected in total

***

### ach\_gems\_balance

> **ach\_gems\_balance**: `number`

The current gems balance

***

### ach\_diamonds\_balance

> **ach\_diamonds\_balance**: `number`

The current diamonds balance

***

### core\_public\_tags

> **core\_public\_tags**: `string`[]

The array of the public tags set on the user object.
They can be treated as server-based cookies.
You can set tags using following method _smartico.event('core_public_tags_update', { core_public_tags: ['A', 'B'] } );
And then you can check for the tags

***

### ach\_level\_current\_id?

> `optional` **ach\_level\_current\_id?**: `number`

The ID of the current level of the user

***

### core\_is\_test\_account?

> `optional` **core\_is\_test\_account?**: `boolean`

The indicator if user is marked as test user

***

### avatar\_url?

> `optional` **avatar\_url?**: `string`

The URL to the user avatar

***

### public\_username?

> `optional` **public\_username?**: `string`

The username of current user

***

### core\_inbox\_unread\_count?

> `optional` **core\_inbox\_unread\_count?**: `number`

THe number of unread inbox messages

***

### core\_recommended\_deposit\_amount?

> `optional` **core\_recommended\_deposit\_amount?**: `number`

The recommended deposit amount for the user

***

### core\_recommended\_casino\_bet\_amount?

> `optional` **core\_recommended\_casino\_bet\_amount?**: `number`

The recommended casino bet amount for the user
