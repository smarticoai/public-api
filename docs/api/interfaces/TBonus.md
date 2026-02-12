# Interface: TBonus

## Properties

### bonus\_id

• **bonus\_id**: `number`

ID of the bonus

___

### is\_redeemable

• `Optional` **is\_redeemable**: `boolean`

Can the bonus be redeemed (if bonus is redeemable the user needs to claim it)

___

### create\_date

• `Optional` **create\_date**: `string`

Date of creation

___

### redeem\_date

• `Optional` **redeem\_date**: `string`

Date of redemption

___

### label\_bonus\_template\_id

• `Optional` **label\_bonus\_template\_id**: `number`

ID of template used

___

### bonus\_status\_id

• `Optional` **bonus\_status\_id**: [`BonusStatus`](../enums/BonusStatus-1.md)

ID of the bonus status

___

### label\_bonus\_template\_meta\_map

• `Optional` **label\_bonus\_template\_meta\_map**: [`BonusTemplateMetaMap`](BonusTemplateMetaMap.md)

Additional information about the bonus(edscription, image,name, acknowledge)

___

### bonus\_meta\_map

• `Optional` **bonus\_meta\_map**: [`BonusMetaMap`](BonusMetaMap.md)

Additional information presented to the player when the bonus is redeemed
