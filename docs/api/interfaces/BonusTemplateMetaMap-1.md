# Interface: BonusTemplateMetaMap

Template-level bonus display metadata (operator-configured at the
bonus template; identical for every bonus issued from the same template).

## Properties

### description

> **description**: `string`

Operator-set description / display text. May include HTML.

***

### acknowledge

> **acknowledge**: `string`

Operator-set additional message shown to the player at claim
time (e.g. wagering terms). May include deep-links.

***

### image\_url

> **image\_url**: `string`

Bonus icon URL (1:1 aspect ratio recommended).

***

### redirect\_url?

> `optional` **redirect\_url?**: `string`

Optional redirect — external HTTP URL (opens in new tab) or
internal deep-link (handled by the SDK's deep-link router).
