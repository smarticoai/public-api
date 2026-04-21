# Interface: TBonus

## Properties

### bonus\_id

> **bonus\_id**: `number`

ID of the bonus

***

### is\_redeemable?

> `optional` **is\_redeemable?**: `boolean`

Can the bonus be redeemed (if bonus is redeemable the user needs to claim it)

***

### create\_date?

> `optional` **create\_date?**: `string`

Date of creation

***

### redeem\_date?

> `optional` **redeem\_date?**: `string`

Date of redemption

***

### label\_bonus\_template\_id?

> `optional` **label\_bonus\_template\_id?**: `number`

ID of template used

***

### bonus\_status\_id?

> `optional` **bonus\_status\_id?**: [`BonusStatus`](../enumerations/BonusStatus-1.md)

ID of the bonus status

***

### label\_bonus\_template\_meta\_map?

> `optional` **label\_bonus\_template\_meta\_map?**: [`BonusTemplateMetaMap`](BonusTemplateMetaMap-1.md)

Additional information about the bonus(edscription, image,name, acknowledge)

***

### bonus\_meta\_map?

> `optional` **bonus\_meta\_map?**: [`BonusMetaMap`](BonusMetaMap-1.md)

Additional information presented to the player when the bonus is redeemed
