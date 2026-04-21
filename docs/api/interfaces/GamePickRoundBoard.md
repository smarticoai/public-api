# Interface: GamePickRoundBoard

GamePickRoundBoard describes a round's leaderboard with ranked users

## Extends

- [`GamePickRoundBase`](GamePickRoundBase.md)

## Properties

### round\_id

> **round\_id**: `number`

Unique round identifier

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`round_id`](GamePickRoundBase.md#round_id)

***

### round\_row\_id

> **round\_row\_id**: `number`

Sequential row ID used for ordering rounds

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`round_row_id`](GamePickRoundBase.md#round_row_id)

***

### round\_name

> **round\_name**: `string`

Localized display name of the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`round_name`](GamePickRoundBase.md#round_name)

***

### round\_description

> **round\_description**: `string`

Localized description of the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`round_description`](GamePickRoundBase.md#round_description)

***

### final\_screen\_cta\_button\_title

> **final\_screen\_cta\_button\_title**: `string`

Label for the CTA button on the final/results screen

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`final_screen_cta_button_title`](GamePickRoundBase.md#final_screen_cta_button_title)

***

### final\_screen\_message

> **final\_screen\_message**: `string`

Message displayed on the final/results screen

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`final_screen_message`](GamePickRoundBase.md#final_screen_message)

***

### final\_screen\_image\_desktop

> **final\_screen\_image\_desktop**: `string`

URL of the final screen image (desktop)

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`final_screen_image_desktop`](GamePickRoundBase.md#final_screen_image_desktop)

***

### final\_screen\_image\_mobile

> **final\_screen\_image\_mobile**: `string`

URL of the final screen image (mobile)

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`final_screen_image_mobile`](GamePickRoundBase.md#final_screen_image_mobile)

***

### promo\_image

> **promo\_image**: `string`

URL of the promotional image for the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`promo_image`](GamePickRoundBase.md#promo_image)

***

### promo\_text

> **promo\_text**: `string`

Promotional text displayed with the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`promo_text`](GamePickRoundBase.md#promo_text)

***

### open\_date

> **open\_date**: `number`

Timestamp (ms) when the round opens for participation

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`open_date`](GamePickRoundBase.md#open_date)

***

### last\_bet\_date

> **last\_bet\_date**: `number`

Timestamp (ms) of the last moment bets are accepted

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`last_bet_date`](GamePickRoundBase.md#last_bet_date)

***

### resolution\_date

> **resolution\_date**: `number`

Timestamp (ms) when the round is expected to be resolved

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`resolution_date`](GamePickRoundBase.md#resolution_date)

***

### score\_full\_win

> **score\_full\_win**: `number`

Points awarded for a fully correct prediction

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`score_full_win`](GamePickRoundBase.md#score_full_win)

***

### score\_part\_win

> **score\_part\_win**: `number`

Points awarded for a partially correct prediction

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`score_part_win`](GamePickRoundBase.md#score_part_win)

***

### score\_lost

> **score\_lost**: `number`

Points awarded (or deducted) for an incorrect prediction

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`score_lost`](GamePickRoundBase.md#score_lost)

***

### is\_active\_now

> **is\_active\_now**: `boolean`

Whether the round is currently active for participation

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`is_active_now`](GamePickRoundBase.md#is_active_now)

***

### is\_resolved

> **is\_resolved**: `boolean`

Whether the round has been fully resolved and scored

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`is_resolved`](GamePickRoundBase.md#is_resolved)

***

### round\_status\_id

> **round\_status\_id**: [`GPRoundStatus`](../enumerations/GPRoundStatus.md)

Current lifecycle status of the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`round_status_id`](GamePickRoundBase.md#round_status_id)

***

### events\_total

> **events\_total**: `number`

Total number of events in the round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`events_total`](GamePickRoundBase.md#events_total)

***

### events\_resolved

> **events\_resolved**: `number`

Number of events that have been resolved

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`events_resolved`](GamePickRoundBase.md#events_resolved)

***

### score\_type\_id

> **score\_type\_id**: [`GamePickScoreType`](../enumerations/GamePickScoreType.md)

Scoring method used for this round

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`score_type_id`](GamePickRoundBase.md#score_type_id)

***

### order\_events

> **order\_events**: [`GameRoundOrderType`](../enumerations/GameRoundOrderType.md)

How events are ordered for display

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`order_events`](GamePickRoundBase.md#order_events)

***

### board\_users\_count

> **board\_users\_count**: `number`

Maximum number of users shown on the leaderboard

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`board_users_count`](GamePickRoundBase.md#board_users_count)

***

### hide\_users\_predictions

> **hide\_users\_predictions**: `boolean`

Whether other users' predictions are hidden until resolution

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`hide_users_predictions`](GamePickRoundBase.md#hide_users_predictions)

***

### public\_meta

> **public\_meta**: [`GamePickRoundPublicMeta`](GamePickRoundPublicMeta.md)

Public metadata including translations and display settings from the BackOffice

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`public_meta`](GamePickRoundBase.md#public_meta)

***

### next\_round\_open\_date

> **next\_round\_open\_date**: `number`

Timestamp (ms) when the next round opens, if available

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`next_round_open_date`](GamePickRoundBase.md#next_round_open_date)

***

### show\_users\_preference

> **show\_users\_preference**: `boolean`

Whether to show aggregated user preference percentages for each outcome

#### Inherited from

[`GamePickRoundBase`](GamePickRoundBase.md).[`show_users_preference`](GamePickRoundBase.md#show_users_preference)

***

### my\_user

> **my\_user**: [`GamePickBoardUser`](GamePickBoardUser.md)

Current user's leaderboard entry, or null if user hasn't participated

***

### users

> **users**: [`GamePickBoardUser`](GamePickBoardUser.md)[]

Ranked list of users on the leaderboard
