# Interface: TBonus

TBonus describes one bonus awarded to the user.
Returned by `_smartico.api.getBonuses()`.

## Properties

### bonus\_id

> **bonus\_id**: `number`

Stable ID of the bonus.

***

### is\_redeemable?

> `optional` **is\_redeemable?**: `boolean`

`true` when the bonus is in a player-claim-required state.
Gate the Claim button on this; see `claimBonus` TSDoc.

***

### create\_date?

> `optional` **create\_date?**: `string`

Bonus creation timestamp as ISO 8601 UTC string
("YYYY-MM-DDTHH:MM:SS", no timezone suffix).

***

### redeem\_date?

> `optional` **redeem\_date?**: `string`

Bonus redemption timestamp as ISO 8601 UTC string. Absent until
the bonus reaches `BonusStatus.REDEEMED`.

***

### label\_bonus\_template\_id?

> `optional` **label\_bonus\_template\_id?**: `number`

ID of the bonus template used to issue this bonus.

***

### bonus\_status\_id?

> `optional` **bonus\_status\_id?**: [`BonusStatus`](../enumerations/BonusStatus-1.md)

Lifecycle status; see [BonusStatus](../enumerations/BonusStatus-1.md).

***

### label\_bonus\_template\_meta\_map?

> `optional` **label\_bonus\_template\_meta\_map?**: [`BonusTemplateMetaMap`](BonusTemplateMetaMap-1.md)

Template-level display metadata (operator-configured, identical
across all bonuses from the same template).

***

### bonus\_meta\_map?

> `optional` **bonus\_meta\_map?**: [`BonusMetaMap`](BonusMetaMap-1.md)

Instance-level display metadata (per-issuance; carries the
dynamic amount computed at award time).
