# Interface: GamePickRoundPublicMeta

GamePickRoundPublicMeta describes the public-facing metadata and translations for a round, configured in the BackOffice

## Properties

### round\_name

> **round\_name**: `string`

Localized round name

***

### round\_description

> **round\_description**: `string`

Localized round description

***

### promo\_image

> **promo\_image**: `string`

URL of the promotional image for the round

***

### promo\_text

> **promo\_text**: `string`

Promotional text displayed with the round

***

### hide\_resolved\_round

> **hide\_resolved\_round**: `boolean`

Whether to hide the round from the UI after it has been resolved

***

### final\_screen\_image\_desktop

> **final\_screen\_image\_desktop**: `string`

URL of the final screen image for desktop

***

### final\_screen\_image\_mobile

> **final\_screen\_image\_mobile**: `string`

URL of the final screen image for mobile

***

### final\_screen\_message

> **final\_screen\_message**: `string`

Message displayed on the final/results screen

***

### final\_screen\_cta\_button\_title

> **final\_screen\_cta\_button\_title**: `string`

Label for the CTA button on the final screen

***

### final\_screen\_cta\_dp

> **final\_screen\_cta\_dp**: `string`

Deep link triggered by the CTA button on the final screen

***

### allow\_edit\_answers?

> `optional` **allow\_edit\_answers?**: `boolean`

Whether users can edit their answers after initial submission (within betting window)

***

### \_translations

> **\_translations**: `object`

Per-language overrides for round display content

#### Index Signature

\[`key`: `string`\]: `object`
