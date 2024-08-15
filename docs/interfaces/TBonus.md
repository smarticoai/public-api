# Interface: TBonus

TBonus describes the information of a bonus and its attributes.

## Properties

### bonus_id

• **bonus_id**: `number`

ID of the bonus.

___

### is_redeemable

• `Optional` **is_redeemable**: `boolean`

Indicates if the bonus can be redeemed.

___

### create_date

• `Optional` **create_date**: `string`

Date when the bonus was created (in ISO format).

___

### update_date

• `Optional` **update_date**: `string`

Date of the last update to the bonus (in ISO format).

___

### redeem_date

• `Optional` **redeem_date**: `string`

Date when the bonus was redeemed (in ISO format).

___

### engagement_uid

• `Optional` **engagement_uid**: `string`

Unique identifier of the bonus. It can be used to request the bonus body or mark the bonus with a specific status.

___

### label_bonus_template_id

• `Optional` **label_bonus_template_id**: `number`

ID of the template used for the bonus.

___

### source_product_ref_id

• `Optional` **source_product_ref_id**: `number`

Reference ID of the source product related to the bonus.

___

### source_product_id

• `Optional` **source_product_id**: `number`

ID of the source product related to the bonus.

___

### user_id

• `Optional` **user_id**: `number`

ID of the user who created the bonus.

___

### bonus_status_id

• `Optional` **bonus_status_id**: [`BonusStatus`](../enums/BonusStatus.md)

ID representing the current status of the bonus.

___

### label_bonus_template_meta_map

• `Optional` **label_bonus_template_meta_map**: [`BonusTemplateMetaMap`](../interfaces/BonusTemplateMetaMap.md)

Additional information about the bonus, such as its description, image, or acknowledge message.

___

### bonus_meta_map

• `Optional` **bonus_meta_map**: [`BonusMetaMap`](../interfaces/BonusMetaMap.md)

UI amount and other metadata related to the bonus.