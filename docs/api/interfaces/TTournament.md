# Interface: TTournament

TTournament describes the general information of the tournament item

## Extended by

- [`TTournamentDetailed`](TTournamentDetailed.md)

## Properties

### instance\_id

> **instance\_id**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

***

### tournament\_id

> **tournament\_id**: `number`

ID of tournament template

***

### name

> **name**: `string`

Name of the tournament, translated to the user language

***

### description

> **description**: `string`

Description of the tournament, translated to the user language

***

### image1

> **image1**: `string`

1st image URL representing the tournament, 544×216px

***

### image2

> **image2**: `string`

2nd image URL representing the tournament, 920x200px

***

### image2\_mobile

> **image2\_mobile**: `string`

2nd image URL representing the tournament for mobile, 720x400px

***

### prize\_pool\_short

> **prize\_pool\_short**: `string`

The message indicating the prize pool of the tournament

***

### custom\_price\_text

> **custom\_price\_text**: `string`

The message indicating the price to register in the tournament

***

### segment\_dont\_match\_message

> **segment\_dont\_match\_message**: `string`

The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS

***

### custom\_section\_id

> **custom\_section\_id**: `number`

The ID of the custom section where the tournament is assigned
The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)

***

### custom\_data

> **custom\_data**: `any`

The custom data of the tournament defined by operator. Can be a JSON object, string or number

***

### is\_featured

> **is\_featured**: `boolean`

The indicator if the tournament is 'Featured'

***

### ribbon

> **ribbon**: `string`

The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250×300px

***

### priority

> **priority**: `number`

A number is used to order the tournaments, representing their priority in the list

***

### me?

> `optional` **me?**: `object`

Info about current player in tournament

#### public\_username

> **public\_username**: `string`

The username of the participant

#### avatar\_url

> **avatar\_url**: `string`

The URL to the avatar of the participant

#### position

> **position**: `number`

The position of the participant in the tournament

#### scores

> **scores**: `number`

The scores of the participant in the tournament

#### user\_ext\_id

> **user\_ext\_id**: `string`

The external user id of the participant

#### crm\_brand\_id

> **crm\_brand\_id**: `number`

The crm brand id of the participant

#### user\_id

> **user\_id**: `number`

The user id of the participant

***

### prizes?

> `optional` **prizes?**: `object`[]

Prize structure

#### name

> **name**: `string`

The name of the prize

#### description

> **description**: `string`

The description of the prize

#### image\_url

> **image\_url**: `string`

The image of the prize, 1:1 aspect ratio

#### place\_from

> **place\_from**: `number`

from-to range of the places to which this prize

#### place\_to

> **place\_to**: `number`

#### type

> **type**: `string`

type of the prize: TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS

#### points?

> `optional` **points?**: `number`

if the prize is points related, indicates amount of points

***

### start\_time

> **start\_time**: `number`

The time when tournament is going to start, epoch with milliseconds

***

### end\_time

> **end\_time**: `number`

The time when tournament is going to finish, epoch with milliseconds

***

### registration\_type

> **registration\_type**: [`TournamentRegistrationTypeName`](../type-aliases/TournamentRegistrationTypeName.md)

Type of registration in the tournament

***

### registration\_count

> **registration\_count**: `number`

Number of users registered in the tournament

***

### is\_user\_registered

> **is\_user\_registered**: `boolean`

flag indicating if current user is registered in the tournament

***

### players\_min\_count

> **players\_min\_count**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

***

### players\_max\_count

> **players\_max\_count**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

***

### registration\_status

> **registration\_status**: [`TournamentRegistrationStatusName`](../enumerations/TournamentRegistrationStatusName.md)

Status of registration in the tournament for current user

***

### duration\_ms

> **duration\_ms**: `number`

Tournament duration in millisecnnds

***

### registration\_cost\_points?

> `optional` **registration\_cost\_points?**: `number`

Cost of registration in the tournament in gamification points

***

### registration\_cost\_gems?

> `optional` **registration\_cost\_gems?**: `number`

Cost of registration in the tournament in gems

***

### registration\_cost\_diamonds?

> `optional` **registration\_cost\_diamonds?**: `number`

Cost of registration in the tournament in diamonds

***

### is\_active

> **is\_active**: `boolean`

Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED

***

### is\_can\_register

> **is\_can\_register**: `boolean`

Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet

***

### is\_cancelled

> **is\_cancelled**: `boolean`

Indicator if tournament instance is cancelled (status CANCELLED)

***

### is\_finished

> **is\_finished**: `boolean`

Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)

***

### is\_in\_progress

> **is\_in\_progress**: `boolean`

Indicator if tournament instance is running (status STARTED)

***

### is\_upcoming

> **is\_upcoming**: `boolean`

Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)

***

### min\_scores\_win?

> `optional` **min\_scores\_win?**: `number`

The minimum amount of score points that the user should get in order to be qualified for the prize

***

### hide\_leaderboard\_min\_scores?

> `optional` **hide\_leaderboard\_min\_scores?**: `boolean`

When enabled, users who don’t meet the minimum qualifying score will be hidden from the Leaderboard

***

### total\_scores?

> `optional` **total\_scores?**: `number`

Total scores across all participants in the tournament
