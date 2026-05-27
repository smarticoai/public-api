# UI Guide — `jackpotOptIn`

## Overview
- Opts the user into a jackpot. After this, the user contributes to the
  pot per their bets and is eligible to win.
- SDK clears the jackpot caches on success — the next
  [`jackpotGet`](../../api/classes/WSAPIJackpots.md#jackpotget) call returns
  `is_opted_in: true`.
- Mutation only; no follow-up data; result is just `{errCode, errMsg}`.

## Loading state

User taps "Join Jackpot" → button enters spinner state.

```ts
const [joining, setJoining] = useState(false);

const onJoin = async () => {
  if (joining) return;
  setJoining(true);
  const r = await window._smartico.api.jackpotOptIn({ jp_template_id });
  setJoining(false);
  handleResult(r);
};
```

## Idempotency guard

The SDK does not prevent double-tap. Guard at the call site as above.
Re-tap behavior:

| State | Server response |
|---|---|
| Already opted in (active registration) | Non-zero `errCode` ("Already opted in") |
| Previously opted in then opted out | Succeeds — re-activates registration |

## Action button decision matrix

| Result | UI action |
|---|---|
| `errCode === 0` | Close modal or update card; show "You're in!" confirmation; refresh the jackpot card to display the opt-out CTA |
| `errCode !== 0` | Show error toast with `errMsg`; keep modal open for retry |

The default Smartico UI shows a generic error modal on any non-zero
`errCode`, without parsing `errMsg`. Custom UIs should surface the
server-provided message for clearer user feedback.

## Refresh after success

- SDK clears the template, pot, and winners caches automatically.
- The next [`jackpotGet`](../../api/classes/WSAPIJackpots.md#jackpotget)
  returns `is_opted_in: true` and an incremented `registration_count`.
- No optimistic update — wait for the result before flipping the card's
  CTA label. Locked-segment / inactive-template rejections are real and
  would produce a flicker if you optimistically toggled.

## Side effects

- Fires a `JACKPOT_OPT_IN` operator-side engagement event (visible to
  automation rules / campaigns).
- Does NOT immediately deduct points / gems — contributions happen
  per-bet during gameplay.
- `registration_count` increments on the next `jackpotGet()`.

## Visitor mode

Not supported. The SDK throws synchronously when called via `_smartico.vapi()`.

## Animations / transitions

- Tap → button morphs to spinner.
- On `errCode === 0` → "Joined!" confirmation pulse, card CTA swaps to
  "Opt Out".
- On error → spinner clears; error toast slides in.

## Mobile vs desktop

- **Mobile**: full-width "Join Jackpot" button anchored at the bottom of
  the modal.
- **Desktop**: button bottom-right of the centered modal.

## Performance

- Single round-trip. Cache invalidation is automatic — don't manually
  refetch unless polling.
