# getInboxMessageBody — API (TInboxMessageBody)

> Returns the rich body of a single inbox message — title, preview text, icon, click action, optional rich HTML body, and optional buttons.
> Import: `import { TInboxMessageBody } from '@smartico/public-api'`
> Search terms: getInboxMessageBody, inbox, TInboxMessageBody, Button, action, icon, title, preview_body, custom_data

## Signature
```ts
_smartico.api.getInboxMessageBody(messageGuid: string): Promise<TInboxMessageBody>
```

## Parameters
- `messageGuid` — The `message_guid` from a `TInboxMessage` returned by `getInboxMessages`.

## Returns — `Promise<TInboxMessageBody>`
`TInboxMessageBody`:
- `title` (string) — Display title.
- `preview_body` (string) — Short preview text (typically rendered alongside the title in list items).
- `icon` (string) — Message icon URL (128×128 px recommended).
- `action` (string) — Click-action — either a deep-link (e.g. `'dp:deposit'`) or a plain URL. The literal `'dp:inbox'` indicates the message has a rich `html_body`; for any other value `html_body` and `buttons` are absent. Pass to `_smartico.dp(action)` for safe execution.
- `html_body` (string) — Rich HTML body. Populated only when `action === 'dp:inbox'`.
- `buttons` ({
		/** Button click-action (deep-link or URL). */
		action: string;
		/** Button label. */
		text: string;
	}[]) — Up to 2 additional action buttons. Populated only when `action === 'dp:inbox'`.
- `custom_data` (string) — Operator-defined custom data. The SDK auto-parses JSON-looking strings, so at runtime this is `any` despite the `string` type.

## Behavioral contract
**Rich vs simple messages**
The shape of the returned body branches on the `action` field:
- When `action === 'dp:inbox'`, the message has a rich HTML body
  (`html_body`) and may have up to 2 action `buttons`. Use these
  for a full-detail rendering.
- For any other `action` (deep-link like `'dp:deposit'` or a URL),
  the message is a simple notification — `html_body` and
  `buttons` will be `undefined` regardless of what's in the
  underlying CDN payload. Render `title` + `preview_body` + a
  single CTA driving the `action`.

**The `action` field**
For both shapes, `action` carries either a deep-link
(`'dp:gf_missions'`) or a plain URL. Pass it to `_smartico.dp()`
for safe execution — that helper handles URL vs deep-link
routing.

**Idempotency / Side effects**: safe. Read-only HTTP fetch.

**UI guidance**: see [UI Guide — `getInboxMessageBody`](../../docs/ui/inbox/UIGuide_getInboxMessageBody.md).

**Visitor mode**: not supported.

## Example
```ts
const body = await window._smartico.api.getInboxMessageBody(messageGuid);

console.log('[smartico] render message — title:', body.title,
  '— preview:', body.preview_body,
  '— icon:', body.icon);

if (body.action === 'dp:inbox' && body.html_body) {
  console.log('[smartico] rich message — render the html_body in a sandboxed iframe; render up to 2 action buttons:',
    body.buttons?.length ?? 0);
} else {
  console.log('[smartico] simple message — show preview_body + single CTA wired to:', body.action,
    '— execute via _smartico.dp(body.action)');
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "action": "dp:close",
  "icon": "https://cdn.example/d0f46ded3f7c9439fa0239-home-gems.webp",
  "title": "Congratulations!",
  "preview_body": "You have received 10 Gems to your balance!",
  "custom_data": {}
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getInboxMessages`
