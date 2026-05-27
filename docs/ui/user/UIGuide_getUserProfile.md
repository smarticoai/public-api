# UI Guide — `getUserProfile`

## Overview
- The synchronous source of truth for the current user's public
  properties — balances, level, username, avatar, tags, language,
  inbox count.
- The SDK keeps a local snapshot updated by a server push channel.
  Every call returns the latest cached values; no network round-trip.
- Drive long-lived widgets (header user-bar, balance display, inbox
  badge, level badge) by **subscribing to `props_change` events** and
  re-reading via `getUserProfile()` on each fire. Don't poll.

## Subscription pattern

The default Smartico UI registers a single `props_change` listener
at boot and re-renders the affected widgets from the current
`getUserProfile()` snapshot. The callback's argument carries only
the changed keys, so you can branch on which subset of widgets to
update:

```ts
window._smartico.on('props_change', (changed) => {
  const profile = window._smartico.api.getUserProfile();

  if ('ach_points_balance' in changed
   || 'ach_gems_balance' in changed
   || 'ach_diamonds_balance' in changed) {
    console.log('[smartico] balance changed — re-render the currency strip:',
      profile.ach_points_balance, profile.ach_gems_balance, profile.ach_diamonds_balance);
  }
  if ('ach_level_current_id' in changed) {
    console.log('[smartico] level changed — call getCurrentLevel() and animate the badge');
  }
  if ('core_inbox_unread_count' in changed) {
    console.log('[smartico] inbox count changed — update the inbox badge to:',
      profile.core_inbox_unread_count);
  }
  if ('core_public_tags' in changed) {
    console.log('[smartico] tags changed — re-evaluate any tag-gated UI:',
      profile.core_public_tags);
  }
});
```

For one-time reads (e.g. inside a click handler), call
`getUserProfile()` directly — no subscription needed.

## Balance widget

The default Smartico UI renders a horizontal strip of currency
counters in the header / menu bar. Render rules:

| Field | Rendered | Format |
|---|---|---|
| `ach_points_balance` | Always | Locale-aware integer (e.g. `"1,234"`); show even when zero. |
| `ach_gems_balance` | Only if the operator has enabled gems for this label | Same locale format. |
| `ach_diamonds_balance` | Only if the operator has enabled diamonds for this label | Same locale format. |

Gems and diamonds are conditionally rendered per label
configuration — not just based on whether the value is non-zero. For
labels that don't use these currencies, hide the counters entirely
rather than showing `0`. (The SDK doesn't expose label settings; ask
the operator or detect by other context.)

Pair the counter with an icon for each currency (points icon, gem
icon, diamond icon). Use brand assets — none ship with the SDK.

## Affordability checks

`getUserProfile()` is the source for paid-mutation gating across
the SDK. Same pattern for each domain:

| Method | Read balance for | Compare against |
|---|---|---|
| [`buyStoreItem`](../../api/classes/WSAPIStore.md#buystoreitem) | `item.purchase_type` (`'points'` / `'gems'` / `'diamonds'`) | `item.discounted_price ?? item.price` |
| [`joinClan`](../../api/classes/WSAPIClans.md#joinclan) | `clan.entry_fee_currency_type_id` (`0`/`1`/`2`/`3`) | `clan.entry_fee_amount` |
| [`registerInTournament`](../../api/classes/WSAPITournaments.md#registerintournament) | Whichever of `registration_cost_points` / `_gems` / `_diamonds` is set | The same field |

Disable the CTA when the user's balance is below the cost; show the
deficit in the disabled state's text.

## Level badge

Render the level badge using `ach_level_current_id` as a lookup key
into the level ladder fetched separately:

1. Call [`getLevels`](../../api/classes/WSAPIUser.md#getlevels) once
   at app boot to cache the full ladder.
2. On `ach_level_current_id` change (via `props_change`), look up the
   level by ID and render its `name` + `image`.
3. For the richer "progress to next level" UI, call
   [`getCurrentLevel`](../../api/classes/WSAPIUser.md#getcurrentlevel)
   — it adds a computed `progress` percentage.

`ach_level_current_id` may briefly be `0` (or undefined) for new
users with no points yet. Handle that as "no level" — render a
default badge (e.g. "Newcomer" or hide the badge).

## Avatar widget

`avatar_url` is a CDN URL resolved by the SDK from the server's
`avatar_id` field. To render:

- Place inside a square container (1:1 aspect ratio).
- The default Smartico UI proxies the URL through a CDN resizer
  (`resize/128/128/webp/...`) for size-appropriate fetches and
  WebP-where-supported. Brands that don't use that resizer can
  load `avatar_url` directly.
- **No built-in placeholder**: when `avatar_url` is missing, the
  default Smartico UI renders an empty container (no fallback
  image). Provide your own placeholder asset / initial-letter
  fallback if the empty state matters.

## Username widget

`public_username` is the user's display name. Fallback chain:

- `public_username` if set
- `'...'` (three dots) or a localized "Anonymous" string if not set

The default Smartico UI uses `'...'`. There's no automatic fallback
to `user_ext_id` — that field is internal and should never be
displayed.

## Inbox badge

`core_inbox_unread_count` is the authoritative source for inbox
unread badge rendering — it's push-updated in real time (under 1
second), unlike
[`getInboxUnreadCount()`](../../api/classes/WSAPIInbox.md#getinboxunreadcount)
which caches for 30 s.

Render rules:

- `0` (or undefined) → badge hidden entirely
- `1`–`N` → render the raw integer (e.g. `"5"`, `"42"`)
- No truncation to `"99+"` in the default Smartico UI; brands that
  want a cap should apply it themselves.

## Public tags

`core_public_tags` is an array of operator-defined uppercase strings
(e.g. `['VIP', 'NEWSLETTER_OPT_IN']`). Use them to gate UI
visibility — show a "VIP rewards" link only when `'VIP'` is in the
array.

To modify tags, use `_smartico.updatePublicTags(operation, tags)` —
the change round-trips through the server and arrives back as a
`props_change` push (usually within ~1 second).

## Language

`core_user_language` is the server-stored language code (e.g.
`"en"`, `"de"`). The SDK uses this for:

- Pre-translated content fields on missions, bonuses, clans, etc.
- The `lang_code` parameter that
  [`getTranslations`](../../api/classes/WSAPIGeneral.md#gettranslations)
  is typically called with.

When the user just changed language client-side, this field may
briefly lag the local intent until the server push arrives. If your
UI needs instant accuracy (e.g. switching the in-page language
without a refresh), use `_smartico.getPublicProps()` which applies
the client-side fallback.

## AI-recommended amounts

`core_recommended_deposit_amount` and
`core_recommended_casino_bet_amount` are AI-computed for the user.
The default Smartico UI doesn't render them — they're exposed for
custom integrations (e.g. operator-specific deposit prompts,
personalized bet suggestions).

Guard against `undefined` — these are absent for users with no
current recommendation.

## Empty / loading / error states

- **Pre-identify**: `getUserProfile()` throws
  `"Tracker is not initialized, cannot getUserProfile"`. Render
  widgets as skeleton/placeholder until the `identify` event fires
  (or until the first `props_change` callback).
- **Visitor mode**: not supported; will throw. Render a "Log in to
  see your profile" CTA instead of a balance widget for anonymous
  sessions.
- **Stale data**: real-time push usually keeps the snapshot under 1
  second behind server state. There's no explicit "stale" state —
  trust the snapshot.

## Animations / transitions

- **Balance changes**: when `ach_points_balance` / `_gems` /
  `_diamonds` change, animate the count-up/down between the prior
  and new value (200–600 ms). Detect by diffing the prior snapshot
  inside `props_change`.
- **Level-up**: when `ach_level_current_id` increases, play a
  celebration animation on the badge (sparkle, scale-up, color
  flash). Detect by diffing the prior `ach_level_current_id`.
- **Inbox badge appearing**: when `core_inbox_unread_count` flips
  from `0` to `>0`, animate the badge fade-in.

## Performance

- `getUserProfile()` is effectively free (synchronous, in-memory
  copy). Call it as often as you need.
- Avoid re-rendering every widget on every `props_change` push —
  branch on the changed keys and re-render only the affected
  surfaces.
- `getUserProfile()` returns a shallow copy on each call; for
  performance-critical paths (e.g. animations), prefer memoizing
  the result inside `props_change` rather than calling on every
  frame.
