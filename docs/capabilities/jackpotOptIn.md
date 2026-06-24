# jackpotOptIn — API (JackpotsOptinResponse)

> Opts the authenticated user into a jackpot.
> Import: `import { JackpotsOptinResponse } from '@smartico/public-api'`
> Search terms: jackpotOptIn, jackpots, JackpotsOptinResponse, errCode, errMsg, cid, ts, uuid, payload, duration

## Signature
```ts
_smartico.api.jackpotOptIn(filter: { jp_template_id: number }): Promise<JackpotsOptinResponse>
```

## Parameters
- `filter.jp_template_id` — ID of the jackpot template to join.

## Returns — `Promise<JackpotsOptinResponse>`
`JackpotsOptinResponse`:
- `cid` (number)
- `ts` (number)
- `uuid` (string)
- `errCode` (number)
- `errMsg` (string)

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `jp_template_id` is mandatory — the SDK throws synchronously if missing.
- The jackpot must currently be active and the user must be in its
 eligibility segment. Ineligible jackpots are filtered out of
 `jackpotGet` entirely, so a card the user sees is opt-in-able.

**Error handling**
The server returns a non-zero `errCode` with a human-readable `errMsg`
for any failure. Common causes:
- User is in a control group.
- Jackpot template is not active (status changed since the user opened
 the card).
- User is already opted in (the SDK has no client-side guard against a
 double-tap; the server enforces).
- DB race / generic server error.

The SDK does NOT enumerate distinct numeric codes for each cause — branch
on `errCode === 0` for success and surface `errMsg` as-is for failures.

**Idempotency / re-opt-in semantics**
- **Already opted in** → returns non-zero `errCode` ("User already opted in").
- **Previously opted in then opted out** → succeeds silently; the server
 re-activates the registration. This is not an error path — a user can
 freely cycle opt-in / opt-out.

**Refresh after success**
- The SDK clears the template, pot, and winners caches.
- The next `jackpotGet` call returns `is_opted_in: true` for this
 template.

**Side effects**
Fires a `JACKPOT_OPT_IN` engagement event (visible to operator-side
automation rules). Does NOT immediately move points / gems — contributions
happen per-bet via the user's gameplay, not on opt-in.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `jackpotOptIn`](../../docs/ui/jackpots/UIGuide_jackpotOptIn.md).

## Example
```ts
const r = await window._smartico.api.jackpotOptIn({ jp_template_id: 42 });

if (r.errCode === 0) {
    console.log('[smartico] opted in — refresh jackpot card to show opt-out CTA');
} else {
    console.error('[smartico] opt-in failed — show this message in an error toast:', r.errMsg);
}
```

### Example response (REAL shape)
```json
{
  "errCode": 1,
  "errMsg": "JP User already opted in to Jackpot",
  "cid": 805,
  "ts": 1782287009179,
  "uuid": "00000000-0000-0000-0000-000000000000",
  "payload": null,
  "duration": null
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `jackpotGet`
- `JackpotsOptinResponse`
