# Interface: TMissionOrBadge

TMissionOrBadge interface describes the information of mission or badge defined in the system

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

### desription

• **desription**: `string`

Description of the mission or badge, translated to the user language

___

### reward

• **reward**: `string`

Description of the mission reward if defined

___

### image

• **image**: `string`

URL of the image of the mission or badge

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

### dt\_start

• **dt\_start**: `number`

The date when the mission was started, relevant for the time limited missions

___

### progress

• **progress**: `number`

The progress of the mission in percents calculated as the aggregated relative percentage of all tasks

___

### cta\_action

• **cta\_action**: `string`

The action that should be performed when user clicks on the mission or badge
Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.do(cta_action);
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
