# Interface: TTournamentDetailed

TTournamentDetailed describes the information of the tournament item and includes list of participants, their scores and position in the tournament leaderboard

## Extends

- [`TTournament`](TTournament.md)

## Properties

### instance\_id

> **instance\_id**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

#### Inherited from

[`TTournament`](TTournament.md).[`instance_id`](TTournament.md#instance_id)

***

### tournament\_id

> **tournament\_id**: `number`

ID of tournament template

#### Inherited from

[`TTournament`](TTournament.md).[`tournament_id`](TTournament.md#tournament_id)

***

### name

> **name**: `string`

Name of the tournament, translated to the user language

#### Inherited from

[`TTournament`](TTournament.md).[`name`](TTournament.md#name)

***

### description

> **description**: `string`

Description of the tournament, translated to the user language

#### Inherited from

[`TTournament`](TTournament.md).[`description`](TTournament.md#description)

***

### image1

> **image1**: `string`

1st image URL representing the tournament, 544×216px

#### Inherited from

[`TTournament`](TTournament.md).[`image1`](TTournament.md#image1)

***

### image2

> **image2**: `string`

2nd image URL representing the tournament, 920x200px

#### Inherited from

[`TTournament`](TTournament.md).[`image2`](TTournament.md#image2)

***

### image2\_mobile

> **image2\_mobile**: `string`

2nd image URL representing the tournament for mobile, 720x400px

#### Inherited from

[`TTournament`](TTournament.md).[`image2_mobile`](TTournament.md#image2_mobile)

***

### prize\_pool\_short

> **prize\_pool\_short**: `string`

The message indicating the prize pool of the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`prize_pool_short`](TTournament.md#prize_pool_short)

***

### custom\_price\_text

> **custom\_price\_text**: `string`

The message indicating the price to register in the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`custom_price_text`](TTournament.md#custom_price_text)

***

### segment\_dont\_match\_message

> **segment\_dont\_match\_message**: `string`

The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS

#### Inherited from

[`TTournament`](TTournament.md).[`segment_dont_match_message`](TTournament.md#segment_dont_match_message)

***

### custom\_section\_id

> **custom\_section\_id**: `number`

The ID of the custom section where the tournament is assigned
The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)

#### Inherited from

[`TTournament`](TTournament.md).[`custom_section_id`](TTournament.md#custom_section_id)

***

### custom\_data

> **custom\_data**: `any`

The custom data of the tournament defined by operator. Can be a JSON object, string or number

#### Inherited from

[`TTournament`](TTournament.md).[`custom_data`](TTournament.md#custom_data)

***

### is\_featured

> **is\_featured**: `boolean`

The indicator if the tournament is 'Featured'

#### Inherited from

[`TTournament`](TTournament.md).[`is_featured`](TTournament.md#is_featured)

***

### ribbon

> **ribbon**: `string`

The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250×300px

#### Inherited from

[`TTournament`](TTournament.md).[`ribbon`](TTournament.md#ribbon)

***

### priority

> **priority**: `number`

A number is used to order the tournaments, representing their priority in the list

#### Inherited from

[`TTournament`](TTournament.md).[`priority`](TTournament.md#priority)

***

### start\_time

> **start\_time**: `number`

The time when tournament is going to start, epoch with milliseconds

#### Inherited from

[`TTournament`](TTournament.md).[`start_time`](TTournament.md#start_time)

***

### end\_time

> **end\_time**: `number`

The time when tournament is going to finish, epoch with milliseconds

#### Inherited from

[`TTournament`](TTournament.md).[`end_time`](TTournament.md#end_time)

***

### registration\_type

> **registration\_type**: [`TournamentRegistrationTypeName`](../type-aliases/TournamentRegistrationTypeName.md)

Type of registration in the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`registration_type`](TTournament.md#registration_type)

***

### registration\_count

> **registration\_count**: `number`

Number of users registered in the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`registration_count`](TTournament.md#registration_count)

***

### is\_user\_registered

> **is\_user\_registered**: `boolean`

flag indicating if current user is registered in the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`is_user_registered`](TTournament.md#is_user_registered)

***

### players\_min\_count

> **players\_min\_count**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

#### Inherited from

[`TTournament`](TTournament.md).[`players_min_count`](TTournament.md#players_min_count)

***

### players\_max\_count

> **players\_max\_count**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

#### Inherited from

[`TTournament`](TTournament.md).[`players_max_count`](TTournament.md#players_max_count)

***

### registration\_status

> **registration\_status**: [`TournamentRegistrationStatusName`](../enumerations/TournamentRegistrationStatusName.md)

Status of registration in the tournament for current user

#### Inherited from

[`TTournament`](TTournament.md).[`registration_status`](TTournament.md#registration_status)

***

### duration\_ms

> **duration\_ms**: `number`

Tournament duration in millisecnnds

#### Inherited from

[`TTournament`](TTournament.md).[`duration_ms`](TTournament.md#duration_ms)

***

### registration\_cost\_points?

> `optional` **registration\_cost\_points?**: `number`

Cost of registration in the tournament in gamification points

#### Inherited from

[`TTournament`](TTournament.md).[`registration_cost_points`](TTournament.md#registration_cost_points)

***

### registration\_cost\_gems?

> `optional` **registration\_cost\_gems?**: `number`

Cost of registration in the tournament in gems

#### Inherited from

[`TTournament`](TTournament.md).[`registration_cost_gems`](TTournament.md#registration_cost_gems)

***

### registration\_cost\_diamonds?

> `optional` **registration\_cost\_diamonds?**: `number`

Cost of registration in the tournament in diamonds

#### Inherited from

[`TTournament`](TTournament.md).[`registration_cost_diamonds`](TTournament.md#registration_cost_diamonds)

***

### is\_active

> **is\_active**: `boolean`

Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED

#### Inherited from

[`TTournament`](TTournament.md).[`is_active`](TTournament.md#is_active)

***

### is\_can\_register

> **is\_can\_register**: `boolean`

Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet

#### Inherited from

[`TTournament`](TTournament.md).[`is_can_register`](TTournament.md#is_can_register)

***

### is\_cancelled

> **is\_cancelled**: `boolean`

Indicator if tournament instance is cancelled (status CANCELLED)

#### Inherited from

[`TTournament`](TTournament.md).[`is_cancelled`](TTournament.md#is_cancelled)

***

### is\_finished

> **is\_finished**: `boolean`

Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)

#### Inherited from

[`TTournament`](TTournament.md).[`is_finished`](TTournament.md#is_finished)

***

### is\_in\_progress

> **is\_in\_progress**: `boolean`

Indicator if tournament instance is running (status STARTED)

#### Inherited from

[`TTournament`](TTournament.md).[`is_in_progress`](TTournament.md#is_in_progress)

***

### is\_upcoming

> **is\_upcoming**: `boolean`

Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)

#### Inherited from

[`TTournament`](TTournament.md).[`is_upcoming`](TTournament.md#is_upcoming)

***

### min\_scores\_win?

> `optional` **min\_scores\_win?**: `number`

The minimum amount of score points that the user should get in order to be qualified for the prize

#### Inherited from

[`TTournament`](TTournament.md).[`min_scores_win`](TTournament.md#min_scores_win)

***

### hide\_leaderboard\_min\_scores?

> `optional` **hide\_leaderboard\_min\_scores?**: `boolean`

When enabled, users who don’t meet the minimum qualifying score will be hidden from the Leaderboard

#### Inherited from

[`TTournament`](TTournament.md).[`hide_leaderboard_min_scores`](TTournament.md#hide_leaderboard_min_scores)

***

### total\_scores?

> `optional` **total\_scores?**: `number`

Total scores across all participants in the tournament

#### Inherited from

[`TTournament`](TTournament.md).[`total_scores`](TTournament.md#total_scores)

***

### related\_games?

> `optional` **related\_games?**: [`AchRelatedGame`](AchRelatedGame-1.md)[]

List of casino games (or other types of entities) related to the tournament

***

### players?

> `optional` **players?**: `object`[]

The list of the tournament participants

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

#### is\_me

> **is\_me**: `boolean`

The indicator if the participant is current user

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

### me?

> `optional` **me?**: `object`

The information about current user in the tournament if he is registered in the tournamnet

#### public\_username

> **public\_username**: `string`

The username of the current user

#### avatar\_url

> **avatar\_url**: `string`

The URL to the avatar of the current user

#### position

> **position**: `number`

The position of the current user in the tournament

#### scores

> **scores**: `number`

The scores of the current user in the tournament

#### user\_ext\_id

> **user\_ext\_id**: `string`

The external user id of the current user

#### crm\_brand\_id

> **crm\_brand\_id**: `number`

The crm brand id of the current user

#### user\_id

> **user\_id**: `number`

The user id of the current user

#### Overrides

[`TTournament`](TTournament.md).[`me`](TTournament.md#me)

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

#### Overrides

[`TTournament`](TTournament.md).[`prizes`](TTournament.md#prizes)

***

### is\_clan\_based?

> `optional` **is\_clan\_based?**: `boolean`

True when this tournament groups participants by clan

***

### clan\_leaderboard?

> `optional` **clan\_leaderboard?**: `object`[]

Ranked list of clans in this tournament; null for non-clan tournaments

#### clan\_id

> **clan\_id**: `number`

#### public\_meta

> **public\_meta**: `object`

##### public\_meta.name

> **name**: `string`

##### public\_meta.description

> **description**: `string`

##### public\_meta.image\_url

> **image\_url**: `string`

#### position

> **position**: `number`

#### total\_score

> **total\_score**: `number`

#### contributing\_members

> **contributing\_members**: `number`

***

### user\_clan\_id?

> `optional` **user\_clan\_id?**: `number`

The clan ID the current user belongs to; null when clanless or non-clan tournament

***

### user\_position\_in\_clan?

> `optional` **user\_position\_in\_clan?**: `number`

The user's rank within their own clan; null when clanless or not registered

***

### user\_score\_in\_clan?

> `optional` **user\_score\_in\_clan?**: `number`

The user's score contribution to their clan; null when clanless or not registered

***

### clan\_prize\_structure?

> `optional` **clan\_prize\_structure?**: `object`[]

Per-clan prize structure; null for non-clan tournaments

#### clan\_place

> **clan\_place**: `number`

#### prize\_type\_id

> **prize\_type\_id**: `number`

1 = Fixed, 2 = Dynamic

#### prize\_pool\_amount

> **prize\_pool\_amount**: `number`

#### activity\_type\_id

> **activity\_type\_id**: `number`

#### details\_json

> **details\_json**: `Record`\<`string`, `any`\>

#### public\_meta

> **public\_meta**: `object`

##### public\_meta.name

> **name**: `string`

##### public\_meta.description

> **description**: `string`

##### public\_meta.image\_url

> **image\_url**: `string`

#### tiers

> **tiers**: `object`[]
