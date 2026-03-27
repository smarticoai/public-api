# Interface: TMissionOrBadge

TMissionOrBadge describes the information of mission or badge defined in the system

## Properties

### id

• **id**: `number`

ID of the mission or badge

___

### type

• **type**: ``"mission"`` \| ``"badge"``

Type of entity. Can be 'mission' or 'badge'

___

### name

• **name**: `string`

Name of the mission or badge, translated to the user language

___

### sub\_header

• **sub\_header**: `string`

Sub-header of the mission, translated to the user language

___

### description

• **description**: `string`

Description of the mission or badge, translated to the user language

___

### reward

• **reward**: `string`

Description of the mission reward if defined

___

### image

• **image**: `string`

URL of the image of the mission or badge, 256x256px

___

### is\_completed

• **is\_completed**: `boolean`

Indicator if the mission is completed or badge is granted

___

### is\_locked

• **is\_locked**: `boolean`

Indicator if the mission is locked. Means that it's visible to the user, but he cannot progress in it until it's unlocked.
Mission may optionally contain the explanation of what should be done to unlock it in the unlock_mission_description property

___

### unlock\_mission\_description

• **unlock\_mission\_description**: `string`

Optional explaination of what should be done to unlock the mission

___

### is\_requires\_optin

• **is\_requires\_optin**: `boolean`

Indicator if the mission requires opt-in. Means that user should explicitly opt-in to the mission in order to start progressing in it

___

### is\_opted\_in

• **is\_opted\_in**: `boolean`

Indicator if the user opted-in to the mission

___

### time\_limit\_ms

• **time\_limit\_ms**: `number`

The amount of time in milliseconds that user has to complete the mission

___

### active\_from\_ts

• **active\_from\_ts**: `number`

Holds time from which mission will become available, for the missions that are targeted to be available from specific date/time

___

### active\_till\_ts

• **active\_till\_ts**: `number`

Holds time till mission will become unavailable, for the missions that are targeted to be available from specific date/time

___

### dt\_start

• **dt\_start**: `number`

The date when the mission was started, relevant for the time limited missions, also indicating opt-it date for mission that requires opt-in and unlock date for Locked mission.

___

### progress

• **progress**: `number`

The progress of the mission in percents calculated as the aggregated relative percentage of all tasks

___

### cta\_action

• **cta\_action**: `string`

The action that should be performed when user clicks on the mission or badge
Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action);
The 'dp' function will handle the CTA and will execute it in the most safe way

___

### cta\_text

• **cta\_text**: `string`

The text of the CTA button, e.g. 'Make a deposit'

___

### custom\_section\_id

• **custom\_section\_id**: `number`

The ID of the custom section where the mission or badge is assigned
The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)

___

### only\_in\_custom\_section

• **only\_in\_custom\_section**: `boolean`

The indicator if the mission or badge is visible only in the custom section and should be hidden from the main overview of missions/badges

___

### custom\_data

• **custom\_data**: `any`

The custom data of the mission or badge defined by operator. Can be a JSON object, string or number

___

### tasks

• **tasks**: [`TMissionOrBadgeTask`](TMissionOrBadgeTask.md)[]

The list of tasks of the mission or badge

___

### related\_games

• `Optional` **related\_games**: [`AchRelatedGame`](AchRelatedGame-1.md)[]

List of casino games (or other types of entities) related to the mission or badge

___

### category\_ids

• **category\_ids**: `number`[]

The list of IDs of the categories where the badge item is assigned, information about categories can be retrieved with getAchCategories method

___

### hint\_text

• `Optional` **hint\_text**: `string`

The T&C text for the missions

___

### position

• `Optional` **position**: `number`

Priority (or position) of the mission in the UI. Low value indicates higher position in the UI

___

### ribbon

• `Optional` **ribbon**: `string`

The ribbon of the mission/badge item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250x300px

___

### ach\_completed\_id

• `Optional` **ach\_completed\_id**: `number`

ID of the completion fact from ach_completed or ach_completed_recurring tables

___

### requires\_prize\_claim

• `Optional` **requires\_prize\_claim**: `boolean`

Flag from achievement if the mission prize will be given only after user claims it

___

### prize\_claimed\_date\_ts

• `Optional` **prize\_claimed\_date\_ts**: `number`

The date/timestamp indicating when the prize was claimed by the user

___

### complete\_date

• `Optional` **complete\_date**: `string`

Time in hours that took this player to complete mission

___

### complete\_date\_ts

• `Optional` **complete\_date\_ts**: `number`

Time of mission/badge being completed, this property shows the epoch time in UTC

___

### completed\_today

• `Optional` **completed\_today**: `boolean`

Flag for mission/badge indicating that mission/badge completed today

___

### completed\_this\_week

• `Optional` **completed\_this\_week**: `boolean`

Flag for mission/badge indicating that mission/badge completed this week

___

### completed\_this\_month

• `Optional` **completed\_this\_month**: `boolean`

Flag for mission/badge indicating that mission/badge completed this month

___

### custom\_section\_type\_id

• `Optional` **custom\_section\_type\_id**: `number`

ID of specific Custom Section type

___

### max\_completion\_count

• `Optional` **max\_completion\_count**: `number`

Max number of times the user can complete a mission in case if mission type is Recurring upon completion. NULL equals infinite.

___

### completion\_count

• `Optional` **completion\_count**: `number`

Current completion count for Recurring upon completion missions

___

### next\_recurrence\_date\_ts

• `Optional` **next\_recurrence\_date\_ts**: `number`

The date/timestamp for recurring missions, which indicating the time remaining until the next recurrence of the mission.
Note that if a mission has an "Active till" date defined, this field is not relevant after that date.

___

### availability\_status

• `Optional` **availability\_status**: [`AchievementAvailabilityStatus`](../enums/AchievementAvailabilityStatus.md)

Availability status of the mission depends on the defined time limits

___

### claim\_button\_title

• `Optional` **claim\_button\_title**: `string`

Title for the claim reward button

___

### claim\_button\_action

• `Optional` **claim\_button\_action**: `string`

Action for the claim reward button

___

### badgeTimeLimitState

• `Optional` **badgeTimeLimitState**: [`BadgesTimeLimitStates`](../enums/BadgesTimeLimitStates.md)

Badge time limit state for badges with time restrictions

___

### hide\_locked\_mission

• `Optional` **hide\_locked\_mission**: `boolean`

Flag from achievement if the mission should be hidden when it is locked, until it's unlocked
