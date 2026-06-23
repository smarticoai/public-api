# Interface: GamePickRequestParams

GamePickRequestParams describes the base parameters required for GamePick API calls

## Extended by

- [`GamePickRoundRequestParams`](GamePickRoundRequestParams.md)

## Properties

### saw\_template\_id

> **saw\_template\_id**: `number`

ID of the MatchX or Quiz game template. The only field the consumer supplies.

***

### ext\_user\_id?

> `optional` **ext\_user\_id?**: `string`

External user ID. Injected by the SDK from the active session; consumers omit it.

***

### smartico\_ext\_user\_id?

> `optional` **smartico\_ext\_user\_id?**: `string`

Platform external user ID. Injected by the SDK from the active session; consumers omit it.

***

### lang?

> `optional` **lang?**: `string`

Language code for translations (e.g. 'EN', 'DE'). Defaults to the session language.
