# Interface: SAWTemplate

## Properties

### saw\_template\_id

• **saw\_template\_id**: `number`

___

### saw\_game\_type\_id

• **saw\_game\_type\_id**: [`SAWGameType`](../enums/SAWGameType.md)

___

### saw\_template\_ui\_definition

• **saw\_template\_ui\_definition**: [`SAWTemplateUI`](SAWTemplateUI.md)

___

### saw\_buyin\_type\_id

• **saw\_buyin\_type\_id**: [`SAWBuyInType`](../enums/SAWBuyInType.md)

___

### buyin\_cost\_points

• `Optional` **buyin\_cost\_points**: `number`

___

### visibile\_when\_can\_spin

• **visibile\_when\_can\_spin**: `boolean`

___

### spin\_count

• `Optional` **spin\_count**: `number`

___

### prizes

• **prizes**: [`SAWPrize`](SAWPrize.md)[]

___

### is\_visible

• **is\_visible**: `boolean`

___

### activeFromDate

• `Optional` **activeFromDate**: `number`

___

### activeTillDate

• `Optional` **activeTillDate**: `number`

___

### jackpot\_add\_on\_attempt

• **jackpot\_add\_on\_attempt**: `number`

___

### jackpot\_current

• **jackpot\_current**: `number`

___

### jackpot\_guaranteed

• **jackpot\_guaranteed**: `number`

___

### maxActiveSpinsAllowed

• **maxActiveSpinsAllowed**: `number`

___

### maxSpinsCount

• **maxSpinsCount**: `number`

___

### maxSpinsPediodMs

• **maxSpinsPediodMs**: `number`

___

### next\_available\_spin\_ts

• `Optional` **next\_available\_spin\_ts**: `number`

___

### saw\_skin\_key

• **saw\_skin\_key**: `string`

___

### saw\_skin\_ui\_definition

• **saw\_skin\_ui\_definition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `skin_folder` | `string` |
| `skin_css` | `string` |
| `use_new_popups?` | `boolean` |
| `lottie_animation_speed?` | `number` |

___

### expose\_game\_stat\_on\_api

• `Optional` **expose\_game\_stat\_on\_api**: `boolean`

___

### requires\_prize\_claim

• `Optional` **requires\_prize\_claim**: `boolean`

___

### relative\_period\_timezone

• `Optional` **relative\_period\_timezone**: `number`

___

### show\_prize\_history

• `Optional` **show\_prize\_history**: `boolean`
