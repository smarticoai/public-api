# Interface: UserAchievement

Achievement object returned by getAchievementMap API. Can represent either a Mission or a Badge.

## Properties

### ach\_id

• **ach\_id**: `number`

Achievement ID

___

### ach\_type\_id

• **ach\_type\_id**: `number`

Type: `1` = Mission, `2` = Badge

___

### ach\_public\_meta

• **ach\_public\_meta**: [`AchievementPublicMeta`](AchievementPublicMeta.md)

Public metadata (name, description, image, etc.)

___

### isCompleted

• **isCompleted**: `boolean`

Whether the achievement is completed

___

### isLocked

• **isLocked**: `boolean`

Whether the achievement is locked

___

### requiresOptin

• **requiresOptin**: `boolean`

Whether opt-in is required

___

### isOptedIn

• **isOptedIn**: `boolean`

Whether user has opted in

___

### start\_date

• **start\_date**: `string`

Start date (ISO string)

___

### start\_date\_ts

• **start\_date\_ts**: `number`

Start date timestamp (ms)

___

### time\_limit\_ms

• **time\_limit\_ms**: `number`

Time limit in milliseconds

___

### progress

• **progress**: `number`

Progress percentage (0-100)

___

### complete\_date

• **complete\_date**: `string`

Completion date (ISO string)

___

### complete\_date\_ts

• **complete\_date\_ts**: `number`

Completion date timestamp (ms)

___

### unlock\_date

• **unlock\_date**: `string`

Unlock date (ISO string)

___

### milliseconds\_till\_available

• **milliseconds\_till\_available**: `number`

Time until available (recurring)

___

### completed\_tasks

• **completed\_tasks**: `number`

Number of completed tasks

___

### achievementTasks

• **achievementTasks**: [`UserAchievementTask`](UserAchievementTask.md)[]

Array of tasks

___

### next\_recurrence\_date\_ts

• **next\_recurrence\_date\_ts**: `number`

Next recurrence timestamp

___

### ach\_status\_id

• **ach\_status\_id**: `number`

Achievement status

___

### scheduledMissionType

• **scheduledMissionType**: `number`

Scheduled mission type

___

### related\_games

• **related\_games**: [`AchRelatedGame`](AchRelatedGame.md)[]

Related games

___

### active\_from\_ts

• **active\_from\_ts**: `number`

Active from timestamp

___

### active\_till\_ts

• **active\_till\_ts**: `number`

Active till timestamp

___

### ach\_categories

• **ach\_categories**: `number[]`

Category IDs

___

### recurring\_quantity

• **recurring\_quantity**: `number`

Max completion count (recurring)

___

### completed\_count

• **completed\_count**: `number`

Completion count (recurring)

___

### ach\_completed\_id

• **ach\_completed\_id**: `number`

Completion record ID

___

### requires\_prize\_claim

• **requires\_prize\_claim**: `boolean`

Whether prize must be claimed

___

### prize\_claimed\_date\_ts

• **prize\_claimed\_date\_ts**: `number`

Prize claim timestamp

___

### completed\_today

• **completed\_today**: `boolean`

Completed today flag

___

### completed\_this\_week

• **completed\_this\_week**: `boolean`

Completed this week flag

___

### completed\_this\_month

• **completed\_this\_month**: `boolean`

Completed this month flag

___

### custom\_section\_type\_id

• **custom\_section\_type\_id**: `number`

Custom section type ID

___

### badgeTimeLimitState

• **badgeTimeLimitState**: `number`

Badge time limit state
