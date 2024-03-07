# Interface: TTournamentDetailed

TTournamentDetailed describes the information of the tournament item and includes list of participants, their scores and position in the tournament leaderboard

## Hierarchy

- [`TTournament`](TTournament.md)

  ↳ **`TTournamentDetailed`**

## Properties

### instance\_id

• **instance\_id**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

#### Inherited from

[TTournament](TTournament.md).[instance_id](TTournament.md#instance_id)

___

### tournament\_id

• **tournament\_id**: `number`

ID of tournament template

#### Inherited from

[TTournament](TTournament.md).[tournament_id](TTournament.md#tournament_id)

___

### name

• **name**: `string`

Name of the tournament, translated to the user language

#### Inherited from

[TTournament](TTournament.md).[name](TTournament.md#name)

___

### description

• **description**: `string`

Description of the tournament, translated to the user language

#### Inherited from

[TTournament](TTournament.md).[description](TTournament.md#description)

___

### image1

• **image1**: `string`

#### Inherited from

[TTournament](TTournament.md).[image1](TTournament.md#image1)

___

### image2

• **image2**: `string`

#### Inherited from

[TTournament](TTournament.md).[image2](TTournament.md#image2)

___

### prize\_pool\_short

• **prize\_pool\_short**: `string`

#### Inherited from

[TTournament](TTournament.md).[prize_pool_short](TTournament.md#prize_pool_short)

___

### custom\_price\_text

• **custom\_price\_text**: `string`

#### Inherited from

[TTournament](TTournament.md).[custom_price_text](TTournament.md#custom_price_text)

___

### segment\_dont\_match\_message

• **segment\_dont\_match\_message**: `string`

The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS

#### Inherited from

[TTournament](TTournament.md).[segment_dont_match_message](TTournament.md#segment_dont_match_message)

___

### custom\_section\_id

• **custom\_section\_id**: `number`

The ID of the custom section where the tournament is assigned
The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)

#### Inherited from

[TTournament](TTournament.md).[custom_section_id](TTournament.md#custom_section_id)

___

### custom\_data

• **custom\_data**: `any`

The custom data of the tournament defined by operator. Can be a JSON object, string or number

#### Inherited from

[TTournament](TTournament.md).[custom_data](TTournament.md#custom_data)

___

### is\_featured

• **is\_featured**: `boolean`

The indicator if the tournament is 'Featured'

#### Inherited from

[TTournament](TTournament.md).[is_featured](TTournament.md#is_featured)

___

### ribbon

• **ribbon**: `string`

The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon

#### Inherited from

[TTournament](TTournament.md).[ribbon](TTournament.md#ribbon)

___

### priority

• **priority**: `number`

A number is used to order the tournaments, representing their priority in the list

#### Inherited from

[TTournament](TTournament.md).[priority](TTournament.md#priority)

___

### start\_time

• **start\_time**: `number`

The time when tournament is going to start, epoch with milliseconds

#### Inherited from

[TTournament](TTournament.md).[start_time](TTournament.md#start_time)

___

### end\_time

• **end\_time**: `number`

The time when tournament is going to finish, epoch with milliseconds

#### Inherited from

[TTournament](TTournament.md).[end_time](TTournament.md#end_time)

___

### registration\_type

• **registration\_type**: [`TournamentRegistrationTypeName`](../README.md#tournamentregistrationtypename)

Type of registration in the tournament

#### Inherited from

[TTournament](TTournament.md).[registration_type](TTournament.md#registration_type)

___

### registration\_count

• **registration\_count**: `number`

Number of users registered in the tournament

#### Inherited from

[TTournament](TTournament.md).[registration_count](TTournament.md#registration_count)

___

### is\_user\_registered

• **is\_user\_registered**: `boolean`

flag indicating if current user is registered in the tournament

#### Inherited from

[TTournament](TTournament.md).[is_user_registered](TTournament.md#is_user_registered)

___

### players\_min\_count

• **players\_min\_count**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

#### Inherited from

[TTournament](TTournament.md).[players_min_count](TTournament.md#players_min_count)

___

### players\_max\_count

• **players\_max\_count**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

#### Inherited from

[TTournament](TTournament.md).[players_max_count](TTournament.md#players_max_count)

___

### registration\_status

• **registration\_status**: [`TournamentRegistrationStatusName`](../enums/TournamentRegistrationStatusName.md)

Status of registration in the tournament for current user

#### Inherited from

[TTournament](TTournament.md).[registration_status](TTournament.md#registration_status)

___

### duration\_ms

• **duration\_ms**: `number`

Tournament duration in millisecnnds

#### Inherited from

[TTournament](TTournament.md).[duration_ms](TTournament.md#duration_ms)

___

### registration\_cost\_points

• **registration\_cost\_points**: `number`

Cost of registration in the tournament in gamification points

#### Inherited from

[TTournament](TTournament.md).[registration_cost_points](TTournament.md#registration_cost_points)

___

### is\_active

• **is\_active**: `boolean`

Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED

#### Inherited from

[TTournament](TTournament.md).[is_active](TTournament.md#is_active)

___

### is\_can\_register

• **is\_can\_register**: `boolean`

Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet

#### Inherited from

[TTournament](TTournament.md).[is_can_register](TTournament.md#is_can_register)

___

### is\_cancelled

• **is\_cancelled**: `boolean`

Indicator if tournament instance is cancelled (status CANCELLED)

#### Inherited from

[TTournament](TTournament.md).[is_cancelled](TTournament.md#is_cancelled)

___

### is\_finished

• **is\_finished**: `boolean`

Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)

#### Inherited from

[TTournament](TTournament.md).[is_finished](TTournament.md#is_finished)

___

### is\_in\_progress

• **is\_in\_progress**: `boolean`

Indicator if tournament instance is running (status STARTED)

#### Inherited from

[TTournament](TTournament.md).[is_in_progress](TTournament.md#is_in_progress)

___

### is\_upcoming

• **is\_upcoming**: `boolean`

Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)

#### Inherited from

[TTournament](TTournament.md).[is_upcoming](TTournament.md#is_upcoming)

___

### related\_games

• `Optional` **related\_games**: [`AchRelatedGame`](AchRelatedGame.md)[]

List of casino games (or other types of entities) related to the tournament

___

### players

• `Optional` **players**: { `public_username`: `string` ; `avatar_url`: `string` ; `position`: `number` ; `scores`: `number` ; `is_me`: `boolean`  }[]

The list of the tournament participants

___

### me

• `Optional` **me**: `Object`

The information about current user in the tournament if he is registered in the tournamnet

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `public_username` | `string` | The username of the current user |
| `avatar_url` | `string` | The URL to the avatar of the current user |
| `position` | `number` | The position of the current user in the tournament |
| `scores` | `number` | The scores of the current user in the tournament |

#### Overrides

[TTournament](TTournament.md).[me](TTournament.md#me)

___

### prizes

• `Optional` **prizes**: { `name`: `string` ; `description`: `string` ; `image_url`: `string` ; `place_from`: `number` ; `place_to`: `number` ; `type`: `string` ; `points?`: `number`  }[]

Prize structure

#### Overrides

[TTournament](TTournament.md).[prizes](TTournament.md#prizes)
