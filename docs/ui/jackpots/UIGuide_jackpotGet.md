# UI Guide — `jackpotGet`

## Overview
- Returns the user-eligible jackpots with their live pot snapshots.
- Designed for 1-Hz polling — the SDK uses a 30 s cache for templates and
  a 1 s cache for pot values so a fast poll produces a smooth counting-up
  pot effect.
- No push subscription. Win events clear the caches; subsequent polls
  pick up the new state.

## List view organization

The default Smartico UI renders jackpots in a 2-column grid sorted by
`is_opted_in` ascending — not-opted-in jackpots come FIRST so the user
sees joinable opportunities before their existing memberships. Cards
stagger-fade in at 100 ms per index.

| Property | Value |
|---|---|
| Grid layout | 2 columns (mobile and desktop) |
| Sort | `is_opted_in` ascending (not-opted-in first) |
| Tabs / filters | None — single flat grid |

## Item card / tile

| Field | Source | Notes |
|---|---|---|
| Background image | `jp_public_meta.image_url` | Gradient overlay; CSS background |
| Name | `jp_public_meta.name` | HTML supported |
| Pot amount | `pot.current_pot_amount_user_currency` | User wallet currency |
| Currency symbol | `user_currency` | Looked up by translation key |
| Status pill | derived | "Opted in" if `is_opted_in`, otherwise nothing |
| Registration count | `registration_count` | Shown on the home-card variant only |
| CTA button | derived | "Join Jackpot" if `!is_opted_in`, otherwise "Details" |

**Click target**: whole-card tap → open detail modal.

## Detail view / popup

The detail modal has three potential tabs:

| Tab | Condition shown | Content |
|---|---|---|
| **Rules** | Always | `jp_public_meta.description` as HTML |
| **Eligible Games** | `ach_related_game_allow_all === false` | Async fetch via [`getJackpotEligibleGames`](../../api/classes/WSAPIJackpots.md#getjackpoteligiblegames); tile grid |
| **Win History** | `expose_winners_over_api === true` | Async fetch via [`getJackpotWinners`](../../api/classes/WSAPIJackpots.md#getjackpotwinners); infinite scroll |

Header shows the live pot amount with `current_pot_amount_user_currency`
and a bouncy animation on modal open.

## Polling for a live counter

The default Smartico UI calls `jackpotGet()` every 1 second while the
jackpots page is mounted. The SDK's split cache (30 s template / 1 s pot)
makes this efficient — only the pot values are re-fetched per second,
not the static template data.

```ts
useEffect(() => {
  const i = setInterval(async () => {
    const jackpots = await window._smartico.api.jackpotGet();
    console.log('[smartico] update each pot card with the new amount and temperature');
  }, 1000);
  return () => clearInterval(i);
}, []);
```

For a single-jackpot widget (e.g. on a casino game page), pass a filter:

```ts
const r = await window._smartico.api.jackpotGet({ related_game_id: 'gold-slot2' });
```

## Currency display rules

Two currency fields on `pot`:

| Use case | Field | Currency |
|---|---|---|
| Card / modal pot amount | `current_pot_amount_user_currency` | `user_currency` |
| Wire amount in jackpot's native currency | `current_pot_amount` | `jp_currency` |

The default Smartico UI always renders user-currency on cards. Use the
native-currency value only when correlating with `getJackpotWinners`
results (which return amounts in `jp_currency`).

## Temperature visual treatment

`pot.current_pot_temperature` is one of `JackPotTemparature` (0 = COLD,
1 = WARM, 2 = HOT, 3 = BURNING). The default Smartico UI does NOT
currently render distinct treatments per temperature — the field is
available for custom UIs to apply color, glow, or animation:

| Temperature | Suggested visual |
|---|---|
| `COLD` (0) | Neutral / blue accent |
| `WARM` (1) | Amber accent |
| `HOT` (2) | Red accent + pulse animation |
| `BURNING` (3) | Red + glow + faster pulse |

For `JackpotType.Personal` jackpots, temperature push events are
suppressed server-side; the value still updates but transitions are not
broadcast.

## Image / asset specs

| Field | Use | Notes |
|---|---|---|
| `jp_public_meta.image_url` | Card background + modal header | Operator-defined; no fixed aspect ratio |
| `jp_public_meta.winner_template` | HTML rendered to the winner after a hit | Operator-authored |
| `jp_public_meta.not_winner_template` | HTML rendered to losers | Operator-authored |

## Refresh

- 30 s template cache + 1 s pot cache.
- Caches clear on opt-in / opt-out / jackpot-win push.
- Filter changes flush both caches.
- No `onUpdate` subscription on this method.

## Empty / loading / error states

- **Empty**: no jackpot eligible for the user — typically render a
  "No jackpots available right now" placeholder, or omit the section.
- **Loading (cold fetch)**: skeleton card placeholders.
- **Error**: keep the prior grid if any; non-blocking banner.

## Mobile vs desktop

- **Grid**: 2-column on both.
- **Card components**: mobile uses `JackpotMobileItem`, desktop uses
  `JackpotItemUI`; visual treatment is otherwise identical.

## Performance

- 1 Hz polling is the intended cadence — fast enough for a smooth pot
  counter, slow enough to be cheap.
- Don't add a client-side cache on top — the SDK's split cache already
  optimizes the common case.
