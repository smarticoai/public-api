# jackpotOptOut — API (JackpotsOptoutResponse)

> Opts the authenticated user out of a jackpot.
> Import: `import { JackpotsOptoutResponse } from '@smartico/public-api'`
> Search terms: jackpotOptOut, jackpots, JackpotsOptoutResponse, errCode, errMsg, cid, ts, uuid, payload, duration

## Signature
```ts
_smartico.api.jackpotOptOut(filter: { jp_template_id: number }): Promise<JackpotsOptoutResponse>
```

## Parameters
- `filter.jp_template_id` — ID of the jackpot template to leave.

## Returns — `Promise<JackpotsOptoutResponse>`
`JackpotsOptoutResponse`:
- `cid` (number)
- `ts` (number)
- `uuid` (string)
- `errCode` (number)
- `errMsg` (string)

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode not supported.
- `jp_template_id` is mandatory — the SDK throws synchronously if missing.

**Error handling**
The server returns a non-zero `errCode` with a human-readable `errMsg` for
any failure. Common causes:
- User has never opted in OR is already opted out — server returns
 non-zero `errCode` for the "already opted out" case. Calling opt-out
 on a jackpot the user has never registered for typically returns
 success (the server finds no registration row to update).
- DB race / generic server error.

Unlike `jackpotOptIn`, opt-out does NOT check the template's status
— the user can opt out of a jackpot that has been deactivated by the
operator.

**Idempotency**
- First opt-out → success.
- Second opt-out → non-zero `errCode` ("Already opted out").
- Opt-out of a never-joined jackpot → typically succeeds silently
 (no registration row to act on).

**Refresh after success**
- The SDK clears the template, pot, and winners caches.
- The next `jackpotGet` call returns `is_opted_in: false` for this
 template and a decremented `registration_count`.

**Side effects**
Fires a `JACKPOT_OPT_OUT` engagement event for operator-side automation
rules. The user's existing contributions to the current pot remain in
place — opt-out stops future contributions but does not refund past ones.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `jackpotOptOut`](../../docs/ui/jackpots/UIGuide_jackpotOptOut.md).

## Example
```ts
const r = await window._smartico.api.jackpotOptOut({ jp_template_id: 42 });

if (r.errCode === 0) {
    console.log('[smartico] opted out — refresh jackpot card to show join CTA');
} else {
    console.error('[smartico] opt-out failed — show this message in an error toast:', r.errMsg);
}
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
{
  "errCode": 0,
  "errMsg": "",
  "cid": 807,
  "ts": 1782229816688,
  "uuid": "00000000-0000-0000-0000-000000000000",
  "payload": null,
  "duration": null
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `jackpotOptIn`
- `jackpotGet`
- `JackpotsOptoutResponse`
