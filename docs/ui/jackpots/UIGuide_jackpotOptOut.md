# UI Guide — `jackpotOptOut`

## Overview
- Opts the user out of a jackpot. Stops future contributions and removes
  win eligibility.
- Reversible — the user can re-join via
  [`jackpotOptIn`](../../api/classes/WSAPIJackpots.md#jackpotoptin).
- Past contributions to the current pot remain — opt-out does not refund.

## Loading state

Same pattern as
[`jackpotOptIn`](../../api/classes/WSAPIJackpots.md#jackpotoptin):
spinner + guard against double-tap.

## Action button decision matrix

| Result | UI action |
|---|---|
| `errCode === 0` | Confirmation message; refresh card to show join CTA |
| `errCode !== 0` (`errMsg` like "Already opted out") | Show error toast with `errMsg` |

## Idempotency

| Prior state | Server response |
|---|---|
| Currently opted in | Success |
| Already opted out (registration exists with optout_date set) | Non-zero `errCode` |
| Never opted in (no registration row) | Typically succeeds silently |

## Confirmation prompt

Because opt-out is a destructive action (stops future contributions), the
default Smartico UI shows a confirmation prompt before sending the
request:

> "Stop contributing to this jackpot? You can rejoin anytime."

Custom UIs may skip the confirmation for power users but the prompt
prevents accidental opt-outs.

## Refresh after success

- SDK clears the template, pot, and winners caches.
- Next [`jackpotGet`](../../api/classes/WSAPIJackpots.md#jackpotget)
  returns `is_opted_in: false` and a decremented `registration_count`.

## Side effects

- Fires `JACKPOT_OPT_OUT` operator-side event.
- Past contributions remain on the pot — opt-out only stops FUTURE
  contributions.

## Visitor mode

Not supported.

## Mobile vs desktop

- **Mobile**: opt-out button at the bottom of the detail modal.
- **Desktop**: opt-out button bottom-right of the centered modal.

## Performance

Single round-trip.
