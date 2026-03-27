# Interface: GamePickRoundPublicMeta

GamePickRoundPublicMeta describes the public-facing metadata and translations for a round, configured in the BackOffice

## Properties

### round\_name

• **round\_name**: `string`

Localized round name

___

### round\_description

• **round\_description**: `string`

Localized round description

___

### promo\_image

• **promo\_image**: `string`

URL of the promotional image for the round

___

### promo\_text

• **promo\_text**: `string`

Promotional text displayed with the round

___

### hide\_resolved\_round

• **hide\_resolved\_round**: `boolean`

Whether to hide the round from the UI after it has been resolved

___

### final\_screen\_image\_desktop

• **final\_screen\_image\_desktop**: `string`

URL of the final screen image for desktop

___

### final\_screen\_image\_mobile

• **final\_screen\_image\_mobile**: `string`

URL of the final screen image for mobile

___

### final\_screen\_message

• **final\_screen\_message**: `string`

Message displayed on the final/results screen

___

### final\_screen\_cta\_button\_title

• **final\_screen\_cta\_button\_title**: `string`

Label for the CTA button on the final screen

___

### final\_screen\_cta\_dp

• **final\_screen\_cta\_dp**: `string`

Deep link triggered by the CTA button on the final screen

___

### allow\_edit\_answers

• `Optional` **allow\_edit\_answers**: `boolean`

Whether users can edit their answers after initial submission (within betting window)

___

### \_translations

• **\_translations**: `Object`

Per-language overrides for round display content

#### Index signature

▪ [key: `string`]: \{ `round_name`: `string` ; `round_description`: `string` ; `promo_image`: `string` ; `promo_text`: `string` ; `final_screen_image_desktop`: `string` ; `final_screen_image_mobile`: `string` ; `final_screen_message`: `string` ; `final_screen_cta_button_title`: `string`  }
