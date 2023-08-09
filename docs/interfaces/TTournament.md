# Interface: TTournament

TTournament interface describes the general information of the tournament item

## Hierarchy

- **`TTournament`**

  ↳ [`TTournamentDetailed`](TTournamentDetailed.md)

## Properties

### instance\_id

• **instance\_id**: `number`

ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run

___

### tournament\_id

• **tournament\_id**: `number`

ID of tournament template

___

### name

• **name**: `string`

Name of the tournament, translated to the user language

___

### description

• **description**: `string`

Description of the tournament, translated to the user language

___

### image1

• **image1**: `string`

___

### image2

• **image2**: `string`

___

### prize\_pool\_short

• **prize\_pool\_short**: `string`

___

### custom\_price\_text

• **custom\_price\_text**: `string`

___

### segment\_dont\_match\_message

• **segment\_dont\_match\_message**: `string`

The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS

___

### custom\_section\_id

• **custom\_section\_id**: `number`

The ID of the custom section where the tournament is assigned
The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)

___

### custom\_data

• **custom\_data**: `any`

The custom data of the tournament defined by operator. Can be a JSON object, string or number

___

### is\_featured

• **is\_featured**: `boolean`

The indicator if the tournament is 'Featured'

___

### ribbon

• **ribbon**: `string`

The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon

___

### start\_time

• **start\_time**: `number`

The time when tournament is going to start, epoch with milliseconds

___

### end\_time

• **end\_time**: `number`

The time when tournament is going to finish, epoch with milliseconds

___

### registration\_type

• **registration\_type**: [`TournamentRegistrationTypeName`](../README.md#tournamentregistrationtypename)

Type of registration in the tournament

___

### registration\_count

• **registration\_count**: `number`

Number of users registered in the tournament

___

### is\_user\_registered

• **is\_user\_registered**: `boolean`

flag indicating if current user is registered in the tournament

___

### players\_min\_count

• **players\_min\_count**: `number`

Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start

___

### players\_max\_count

• **players\_max\_count**: `number`

Maximum number of participant for this tournament. When reached, new users won't be able to register

___

### registration\_status

• **registration\_status**: `TournamentRegistrationStatusName`

Status of registration in the tournament for current user

___

### duration\_ms

• **duration\_ms**: `number`

Tournament duration in millisecnnds

___

### registration\_cost\_points

• **registration\_cost\_points**: `number`

Cost of registration in the tournament in gamification points

___

### is\_active

• **is\_active**: `boolean`

Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED

___

### is\_can\_register

• **is\_can\_register**: `boolean`

Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet

___

### is\_cancelled

• **is\_cancelled**: `boolean`

Indicator if tournament instance is cancelled (status CANCELLED)

___

### is\_finished

• **is\_finished**: `boolean`

Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)

___

### is\_in\_progress

• **is\_in\_progress**: `boolean`

Indicator if tournament instance is running (status STARTED)

___

### is\_upcoming

• **is\_upcoming**: `boolean`

Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)
