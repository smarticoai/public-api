# reportImpressionEvent — API

> Records that an engagement (inbox message, popup) was displayed to the user.
> Import: `import { /* types */ } from '@smartico/public-api'`
> Search terms: reportImpressionEvent, inbox

## Signature
```ts
_smartico.api.reportImpressionEvent({
		engagement_uid,
		activityType,
	}: {
		/** For inbox: the message's `message_guid` from `getInboxMessages`. For popups: the popup's GUID from the popup display callback. */
		engagement_uid: string;
		/** `ActivityTypeLimited.Inbox` (`31`) for inbox; `Popup` (`30`) for popups. */
		activityType: ActivityTypeLimited | number;
	}): void
```

## Parameters
_None._

## Returns
See `the domain types`.

## Behavioral contract
**When to call**
- Inbox: when a message becomes visible (the user opens / scrolls
 it into view). The default Smartico UI fires this when the
 message detail expands, alongside
 `markInboxMessageAsRead`.
- Popup: when the popup content is shown to the user.

**Activity types**
Pass `ActivityTypeLimited.Inbox` (`31`) for inbox messages,
`ActivityTypeLimited.Popup` (`30`) for popups. Other values
are not used by the engagement-impression channel.

**Idempotency**: the server records every impression event —
repeated calls add to the impression count. Don't fire it on
every re-render; fire it once per logical "display" event
(modal open, list-row scroll-into-view, popup show).

**Side effects**: server-side increments the engagement's
`impression_count` and updates `last_impression_date`. The
counter is observable via operator analytics; the SDK consumer
receives no signal back.

**Visitor mode**: not supported.

## Example
```ts
// When the user opens an inbox message in the detail view.
window._smartico.api.reportImpressionEvent({
  engagement_uid: message.message_guid,
  activityType: 31,  // ActivityTypeLimited.Inbox
});
console.log('[smartico] inbox impression reported for', message.message_guid, '— no response to await, fire-and-forget');
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `markInboxMessageAsRead`
- `ActivityTypeLimited.Inbox`
- `ActivityTypeLimited.Popup`
