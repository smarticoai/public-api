# Interface: TInboxMessageBody

## Properties

### title

• **title**: `string`

Message title

___

### preview\_body

• **preview\_body**: `string`

Short preview body of the message

___

### icon

• **icon**: `string`

Message icon

___

### action

• **action**: `string`

The action that should be performed when user clicks on the message.
Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.dp(cta_action);
The 'dp' function will handle the CTA and will execute it in the most safe way. 
If the message has a rich html body - the action will always be 'dp:inbox' which will open the inbox widget when triggered.

___

### html\_body

• `Optional` **html\_body**: `string`

Rich HTML body of the message.

___

### buttons

• `Optional` **buttons**: { `action`: `string` ; `text`: `string`  }[]

Optional additional buttons to show in the message, available only if message has rich HTML body. Max count - 2.
