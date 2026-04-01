# Interface: SAWTemplateUI

UI configuration for a SAW (Spin-And-Win) mini-game template.

This interface is returned as the `saw_template_ui_definition` property of
[SAWTemplate](SAWTemplate.md) and [TMiniGameTemplate](TMiniGameTemplate.md).  It covers all visual,
behavioural and game-type-specific settings that the operator can configure
in the Back-Office for every mini-game variant (Spin the Wheel, Scratch Card,
Gift Box, MatchX / Quiz, Treasure Hunt, Lootbox, Voyager, Prize Drop, etc.).

## Properties

### skin

• **skin**: `string`

CSS skin key that selects the overall visual theme of the game.
Resolved at runtime to the matching skin folder / CSS bundle.

___

### name

• **name**: `string`

Display name of the mini-game template shown to players and in the
Back-Office listing.  Supports translations via
`saw_template_ui_definition._translations.<lang>.name`.

___

### description

• `Optional` **description**: `string`

HTML-capable description / rules text shown to the player before or
during the game.  Supports translations via
`saw_template_ui_definition._translations.<lang>.description`.

___

### thumbnail

• `Optional` **thumbnail**: `string`

URL of the thumbnail image (typically 256 × 256 px) shown in
mini-game selection lists and galleries.

___

### over\_limit\_message

• `Optional` **over\_limit\_message**: `string`

HTML-capable message shown to a player who has reached the maximum
number of allowed attempts for the current period.
Rendered when the server rejects a spin with
`SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`.
Supports translations via
`saw_template_ui_definition._translations.<lang>.over_limit_message`.

Only relevant when `max_spins_count` is configured on the template.

___

### no\_attempts\_message

• `Optional` **no\_attempts\_message**: `string`

HTML-capable message shown when the player has no spin attempts or
insufficient points / gems / diamonds to play.
Supports translations via
`saw_template_ui_definition._translations.<lang>.no_attempts_message`.

Only relevant for buy-in types `Spins`, `Points`, `Gems`, or `Diamonds`.

___

### sectors\_count

• **sectors\_count**: `number`

Number of prize sectors on the wheel or gift-box grid.
For Spin-the-Wheel games the Back-Office enforces a range of 3 – 10.

___

### priority

• **priority**: `number`

Relative display order of the mini-game within a list.
Lower values appear first.  Configurable in the Back-Office
"Priority" field (Advanced section).

___

### flow\_builder\_only

• **flow\_builder\_only**: `boolean`

When `true` the mini-game is **excluded from the widget's automatic
game listing** and is only accessible when it is explicitly triggered
via a Campaign Flow Builder action or accessed by deep links or triggered over the api.

Back-Office label:
_"Available only from campaign (won't be visible in the widget)"_

___

### background\_image

• `Optional` **background\_image**: `string`

URL of the full-bleed background image shown on desktop devices.
Not used for Plinko and Coin Flip game types.

___

### background\_image\_mobile

• `Optional` **background\_image\_mobile**: `string`

URL of the full-bleed background image shown on mobile devices.
Falls back to [background_image](SAWTemplateUI.md#background_image) when absent.
Not used for Plinko and Coin Flip game types.

___

### background\_sound

• `Optional` **background\_sound**: `string`

URL of the audio file (MP3 / WAV) played as background music
during gameplay.  Silenced when [disable_background_music](SAWTemplateUI.md#disable_background_music)
is `true` or the player has muted audio.

___

### background\_music\_volume

• `Optional` **background\_music\_volume**: `number`

Volume level of the background music, expressed as a percentage
in the range `0` – `100`.

___

### disable\_background\_music

• `Optional` **disable\_background\_music**: `boolean`

When `true`, background music is muted even if a
[background_sound](SAWTemplateUI.md#background_sound) URL is provided.
Defaults to `true` in the Skin Editor preview scaffolding.

___

### spin\_animation\_duration

• `Optional` **spin\_animation\_duration**: `number`

Duration in milliseconds of the spin animation before the result
is revealed (e.g. `3000` = 3 seconds).
Applies to Spin-the-Wheel and similar animated game types.

___

### wheel\_pointer\_rotation

• `Optional` **wheel\_pointer\_rotation**: `number`

Rotation offset in degrees applied to the visual pointer / arrow
on the wheel to compensate for skin-specific alignment differences.

___

### wheel\_layout

• `Optional` **wheel\_layout**: [`SAWWheelLayout`](../enums/SAWWheelLayout.md)

Screen positioning of the wheel relative to the game panel.

| Value | Meaning |
| --- | --- |
| `SAWWheelLayout.Centered = 1` | Wheel centred in the panel |
| `SAWWheelLayout.LeftAligned = 2` | Wheel pinned to the left |
| `SAWWheelLayout.RightAligned = 3` | Wheel pinned to the right |
| `SAWWheelLayout.BottomAligned = 4` | Wheel pinned to the bottom |

Applies to Spin-the-Wheel games only.
Back-Office label: _"Wheel layout"_.

___

### scratch\_logo

• `Optional` **scratch\_logo**: `string`

URL of the logo image overlaid on the scratch-card surface
before the player scratches.

___

### scratch\_cover

• `Optional` **scratch\_cover**: `string`

URL of the cover / foil image that the player scratches away
to reveal the prize beneath.

___

### scratch\_bg\_desktop

• `Optional` **scratch\_bg\_desktop**: `string`

URL of the background image shown behind the scratch card on
desktop devices.
Back-Office label: _"Scratch main desktop background"_.

___

### scratch\_bg\_mobile

• `Optional` **scratch\_bg\_mobile**: `string`

URL of the background image shown behind the scratch card on
mobile devices.
Back-Office label: _"Scratch main mobile background"_.

___

### scratch\_cursor

• `Optional` **scratch\_cursor**: `string`

URL of a custom cursor image used when the pointer hovers over
the scratchable area.
Back-Office label: _"Scratch mouse cursor"_.

___

### hide\_prize\_names

• `Optional` **hide\_prize\_names**: `boolean`

When `true`, prize / reward names are hidden inside the scratch-card
UI so the player does not know what they won until they have fully
scratched the card.

Only rendered for `SAWGameType.ScratchCard`.
Back-Office label: _"Hide prize names"_.

___

### custom\_css

• `Optional` **custom\_css**: `string`

Raw CSS injected into the game iframe, allowing fine-grained
overrides beyond what the selected skin provides.

___

### custom\_skin\_folder

• `Optional` **custom\_skin\_folder**: `string`

Path to an alternative folder from which skin assets (images,
CSS, JS) are loaded instead of the default skin bundle.

___

### jackpot\_symbol

• `Optional` **jackpot\_symbol**: `string`

Label / symbol appended to the jackpot amount to give it semantic
meaning (e.g. `"EUR"`, `"Free spins"`).
Displayed alongside [jackpot_current](SAWTemplate.md#jackpot_current).
Back-Office label: _"Jackpot symbol"_.

___

### promo\_image

• `Optional` **promo\_image**: `string`

URL of a promotional banner image (recommended 500 × 240 px)
displayed inside the game UI to advertise an offer or campaign.
Supports per-language variants via
`saw_template_ui_definition.promo_image_<lang>`.

___

### promo\_text

• `Optional` **promo\_text**: `string`

HTML-capable promotional text displayed alongside
[promo_image](SAWTemplateUI.md#promo_image).  Supports translations via
`saw_template_ui_definition._translations.<lang>.promo_text`.

___

### matchx\_banner

• `Optional` **matchx\_banner**: `string`

URL of the banner image shown at the top of the MatchX / Quiz
tournament leaderboard on desktop.
Back-Office label: _"Banner"_.

___

### matchx\_banner\_mobile

• `Optional` **matchx\_banner\_mobile**: `string`

URL of the mobile-optimised banner image for the MatchX / Quiz
tournament leaderboard.

___

### matchx\_seasonal\_ranking

• `Optional` **matchx\_seasonal\_ranking**: `boolean`

When `true`, tournament rankings are reset on a seasonal cadence
rather than being continuous.

___

### matchx\_is\_completed

• `Optional` **matchx\_is\_completed**: `boolean`

When `true`, the MatchX / Quiz tournament has concluded.
New entries are blocked and the final leaderboard is shown.

___

### matchx\_general\_board\_users\_count

• `Optional` **matchx\_general\_board\_users\_count**: `number`

Maximum number of players visible on the general leaderboard
inside the MatchX / Quiz game.

___

### matchx\_hide\_ranking

• `Optional` **matchx\_hide\_ranking**: `boolean`

When `true`, the ranking / leaderboard panel is hidden from
players inside the MatchX / Quiz game.
Back-Office label: _"Hide ranking"_.

___

### prize\_pool\_image

• `Optional` **prize\_pool\_image**: `string`

URL of an image used to illustrate the prize pool (e.g. a trophy
or coins graphic).

___

### show\_prize\_board

• `Optional` **show\_prize\_board**: `boolean`

When `true`, a panel listing the available prizes is displayed
inside the game.

Back-Office label: _"Show the list of the prizes"_.
Defaults to `true` in the MatchX / Quiz game form.

___

### max\_spins\_period\_ms

• `Optional` **max\_spins\_period\_ms**: `number`

The rolling time-window in milliseconds within which
`SAWTemplate.maxSpinsCount` attempts are allowed
(e.g. `86400000` = 24 hours).

Stored on the template root as `max_spins_period_ms`; mirrored here
for convenience in UI preview payloads.

___

### show\_countdown\_for\_next\_availability

• `Optional` **show\_countdown\_for\_next\_availability**: `boolean`

When `true`, a countdown timer showing when the next spin becomes
available is displayed to the player.

Only active when `max_spins_count === 1` **and** `max_spins_period_ms`
is set; automatically forced to `false`.

Back-Office label: _"Show time to the next available spin"_.

___

### ask\_for\_username

• `Optional` **ask\_for\_username**: [`SAWAskForUsername`](../enums/SAWAskForUsername.md)

Controls when (or whether) the player is asked to provide a
display name before or after playing.

| Value | Meaning |
| --- | --- |
| `SAWAskForUsername.NOASK = 'no-ask'` | Never ask |
| `SAWAskForUsername.ONSUMBIT = 'on-submit'` | Ask when submitting |

Back-Office label: _"Ask for username"_.

___

### custom\_section\_id

• `Optional` **custom\_section\_id**: `number`

ID of the custom section (category / tab) this mini-game belongs to,
allowing operators to group games in bespoke widget sections.
Back-Office label: _"Custom section"_.

___

### only\_in\_custom\_section

• `Optional` **only\_in\_custom\_section**: `boolean`

When `true`, the template is shown **only** inside its assigned
custom section and is suppressed from all standard game listings.

___

### expose\_user\_spin\_id

• `Optional` **expose\_user\_spin\_id**: [`SAWExposeUserSpinId`](../enums/SAWExposeUserSpinId.md)

Determines which identifier is forwarded in webhooks and the
Retention API when a spin result is produced.

| Value | Meaning |
| --- | --- |
| `SAWExposeUserSpinId.UserId = 1` | Expose the operator's external user ID |
| `SAWExposeUserSpinId.SpinId = 2` | Expose the internal spin transaction ID |

Back-Office label:
_"Expose 'External user ID' or 'Spin transaction ID'"_.

___

### custom\_data

• **custom\_data**: `any`

Arbitrary operator-defined payload attached to the template.
Can be a JSON object, plain string, or number.  Passed through to
the front-end as-is and accessible via the public API.
Back-Office label: _"Custom data field"_.

___

### placeholder1

• `Optional` **placeholder1**: `string`

First free-form placeholder string used by Prize Drop game skins
to inject operator-defined copy into the game UI.

___

### placeholder2

• `Optional` **placeholder2**: `string`

Second free-form placeholder string used by Prize Drop game skins
to inject operator-defined copy into the game UI.

___

### prize\_drop\_template

• `Optional` **prize\_drop\_template**: `Object`

Template definition for the Prize Drop game overlay.
`id` is the unique template identifier; `content` is the raw HTML
rendered inside the drop panel.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | Unique identifier for this prize-drop HTML template. |
| `content` | `string` | HTML content rendered inside the prize-drop panel. |

___

### game\_layout

• `Optional` **game\_layout**: [`SAWGameLayout`](../enums/SAWGameLayout.md)

Visual arrangement of items in Lootbox (Weekly / Calendar Days)
game types.

| Value | Meaning |
| --- | --- |
| `SAWGameLayout.Horizontal = 1` | Items laid out in a horizontal row |
| `SAWGameLayout.VerticalMap = 2` | Items arranged as a vertical map path |

Back-Office label: _"Visual layout"_.

___

### steps\_to\_finish\_game

• `Optional` **steps\_to\_finish\_game**: `number`

Total number of path steps / cells a player must progress through
to complete a Treasure Hunt game and receive the final prize.
Higher values result in longer gameplay sessions.
Back-Office label: _"Steps to finish game"_.

___

### game\_difficulty

• `Optional` **game\_difficulty**: [`SAWGameDifficultyType`](../enums/SAWGameDifficultyType.md)

Difficulty level of the Voyager (space-exploration) mini-game,
controlling obstacle frequency and game speed.

| Value | Meaning |
| --- | --- |
| `SAWGameDifficultyType.EASY = 1` | Easy |
| `SAWGameDifficultyType.MEDIUM = 2` | Medium |
| `SAWGameDifficultyType.HARD = 3` | Hard |
