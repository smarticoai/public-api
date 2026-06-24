# reportClickEvent — API

> Records that the user interacted with an engagement — typically tapping a CTA button, following a deep-link, or clicking a popup action.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: reportClickEvent, inbox

## Signature
```ts
_smartico.api.reportClickEvent({
		engagement_uid,
		activityType,
		action,
	}: {
		/** For inbox: the message's `message_guid` from `getInboxMessages`. */
		engagement_uid: string;
		/** `ActivityTypeLimited.Inbox` (`31`) for inbox; `Popup` (`30`) for popups. */
		activityType: ActivityTypeLimited | number;
		/** The deep-link / URL the user triggered (optional but recommended for analytics fidelity). */
		action?: string;
	}): void
```

## Parameters
_None._

## Returns
_No return value._

## Behavioral contract
**When to call**
- Inbox: when the user taps a CTA button on a message or follows
 a deep-link inside the message body. Pass the deep-link or URL
 as `action`.
- Popup: when the user clicks a popup action button.

**Activity types**
Pass `ActivityTypeLimited.Inbox` (`31`) for inbox,
`ActivityTypeLimited.Popup` (`30`) for popups.

**`action` payload**
Pass the deep-link or URL that the user triggered (e.g.
`'dp:gf_missions'`, `'https://example.com/promo'`). The SDK
forwards the string to the server for analytics — it does not
execute the deep-link. To execute deep-links safely, call
`_smartico.dp(action)` separately.

**Idempotency**: the server records every click event —
repeated calls add to the count. Fire once per logical user
action.

**Side effects**: server-side updates the engagement's
`last_action` field; observable via operator analytics. The SDK
consumer receives no signal back.

**Visitor mode**: not supported.

## Example
```ts
// When the user taps a CTA button in an inbox message.
window._smartico.api.reportClickEvent({
  engagement_uid: message.message_guid,
  activityType: 31,  // ActivityTypeLimited.Inbox
  action: 'dp:gf_missions',
});
window._smartico.dp('dp:gf_missions');   // separately execute the deep-link
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `reportImpressionEvent`
- `ActivityTypeLimited.Inbox`
- `ActivityTypeLimited.Popup`
