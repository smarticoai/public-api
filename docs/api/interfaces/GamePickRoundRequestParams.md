# Interface: GamePickRoundRequestParams

GamePickRoundRequestParams extends base params with a specific round ID

## Extends

- [`GamePickRequestParams`](GamePickRequestParams.md)

## Properties

### saw\_template\_id

> **saw\_template\_id**: `number`

ID of the MatchX or Quiz game template. The only field the consumer supplies.

#### Inherited from

[`GamePickRequestParams`](GamePickRequestParams.md).[`saw_template_id`](GamePickRequestParams.md#saw_template_id)

***

### ext\_user\_id?

> `optional` **ext\_user\_id?**: `string`

External user ID. Injected by the SDK from the active session; consumers omit it.

#### Inherited from

[`GamePickRequestParams`](GamePickRequestParams.md).[`ext_user_id`](GamePickRequestParams.md#ext_user_id)

***

### smartico\_ext\_user\_id?

> `optional` **smartico\_ext\_user\_id?**: `string`

Platform external user ID. Injected by the SDK from the active session; consumers omit it.

#### Inherited from

[`GamePickRequestParams`](GamePickRequestParams.md).[`smartico_ext_user_id`](GamePickRequestParams.md#smartico_ext_user_id)

***

### lang?

> `optional` **lang?**: `string`

Language code for translations (e.g. 'EN', 'DE'). Defaults to the session language.

#### Inherited from

[`GamePickRequestParams`](GamePickRequestParams.md).[`lang`](GamePickRequestParams.md#lang)

***

### round\_id

> **round\_id**: `number`

ID of the specific round
