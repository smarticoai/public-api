# Interface: InboxMessageBody

Inbox message body content (raw, non-transformed).

## Properties

### action

• **action**: `string`

Action to perform when message is clicked (deeplink format)

___

### body

• **body**: `string`

Plain text message body

___

### type

• **type**: `InboxMessageType`

Message type (SystemMessage=1, LevelUp=2, Achievement=3, Badge=4, Offer=5, PointsEarned=6, PointsUsed=7, PersonalMessage=8)

___

### image

• **image**: `string`

Message image URL

___

### title

• **title**: `string`

Message title

___

### html\_body

• **html\_body**: `string`

Rich HTML body content

___

### additional\_buttons

• **additional\_buttons**: `object[]`

Additional CTA buttons array (optional)

| Property | Type | Description |
|----------|------|-------------|
| `inbox_cta_text` | `string` | Button text |
| `action` | `string` | Button action (deeplink) |
