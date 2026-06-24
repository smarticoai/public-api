# getUserProfile — API (TUserProfile)

> Returns the current user's public profile — the source of truth for balances (points / gems / diamonds), the current level ID, the display username + avatar, language, public tags, and the inbox unread count.
> Import: `import { TUserProfile } from '@smartico/public-api'`
> Search terms: getUserProfile, user, getPublicProps, getProfile, balance, points, TUserProfile, core_public_tags, ach_points_ever, core_clan_is_kicked, user_last_session_push_state, aff_referred_by_friend_ext_user_id, core_inbox_unread_count, core_user_language, ach_level_current

## Signature
```ts
_smartico.api.getUserProfile(): TUserProfile
```

## Parameters
_None._

## Returns — `TUserProfile`
- `core_public_tags` (array) — Server-stored public tags on the user (uppercase strings). Modify via `_smartico.updatePublicTags(operation, tags)`.
- `ach_points_ever` (number) — All-time cumulative points earned. Monotonic — NOT decremented by store purchases or clan/tournament fees.
- `core_clan_is_kicked` (null) — `true` when the user was kicked from their clan; null when not applicable.
- `user_last_session_push_state` (string) — Last-session browser push-permission state (e.g. `"BLOCKED"`, `"GRANTED"`).
- `aff_referred_by_friend_ext_user_id` (null) — ext_user_id of the friend who referred this user; null when none.
- `core_inbox_unread_count` (number) — Unread inbox messages count. Push-updated in real time.
- `core_user_language` (string) — Language code stored server-side for the user (e.g. `"en"`, `"de"`).
- `ach_level_current` (string) — Display name of the user's current level (e.g. `"Silver"`); resolve the id via `getCurrentLevel()`.
- `ach_gems_balance` (number) — Current gems balance (secondary currency).
- `ach_level_current_id` (number) — FK into the level ladder; resolve via `getCurrentLevel()` or `getLevels()`.
- `user_country` (string) — ISO country code of the user (e.g. `"BG"`).
- `ach_points_balance` (number) — Current spendable points balance — decremented by store purchases, tournament buy-ins, and clan entry fees.
- `core_registration_date` (number) — Registration timestamp (epoch ms); `0` when unknown.
- `core_recommended_deposit_amount` (number) — AI-recommended deposit amount for this user. Undefined when no recommendation is currently available.
- `core_recommended_casino_bet_amount` (number) — AI-recommended casino bet amount for this user. Undefined when no recommendation is currently available.
- `ach_gamification_in_control_group` (boolean) — `true` when the user is in the gamification A/B control group (gamification UI suppressed).
- `core_avatar_real_id` (null) — `avatar_real_id` of the user's core avatar; null when unset.
- `core_wallet_currency` (string) — Wallet currency code (e.g. `"EUR"`).
- `ach_diamonds_balance` (number) — Current diamonds balance (tertiary currency).
- `aff_refer_friend_url` (null) — Refer-a-friend share URL; null when the feature is disabled.
- `acc_bonus_abuser` (boolean) — `true` when the account is flagged as a bonus abuser.
- `aff_refered_friends_count` (number) — Count of friends this user has referred.
- `core_clan_kicked_out_id` (null) — Id of the clan the user was kicked from; null when not applicable.
- `core_clan_id` (string) — Current clan id (string); empty/null when not in a clan.
- `core_is_test_account` (boolean) — `true` when the user is flagged as a test account.
- `user_id` (number) — Smartico-internal numeric user id.
- `avatar_id` (string) — Selected avatar id (catalogue avatar or AI-variant base).
- `avatar_real_id` (number) — `avatar_real_id` of the selected avatar; `0` when none.
- `public_username` (string) — Display username (operator-defined alias).
- `avatar_url` (string) — Resolved CDN URL for the user's avatar.

## Behavioral contract
**Preconditions**
The tracker must be initialised — calling this before the identify
round-trip completes throws (`"Tracker is not initialized, cannot
getUserProfile"`). Safe ways to wait for readiness:
- register `_smartico.on('identify', (errCode, props) => ...)` —
 fires once after a successful identify with the full props
- register `_smartico.on('props_change', () => ...)` — fires first
 at identify with the full snapshot, then on every push update

**What's kept live (push-updated)**
Balance fields (`ach_points_balance`, `ach_gems_balance`,
`ach_diamonds_balance`, `ach_points_ever`), `ach_level_current_id`,
`core_public_tags`, `core_inbox_unread_count`, `core_user_language`,
`avatar_url`, `public_username`, and the AI-driven recommended-amount
fields all flow over the SDK's user-properties update channel as
partial updates — the snapshot is patched in place when any of them
change server-side. Re-call `getUserProfile()` (or watch
`props_change`) to observe new values.

**Reading state from the returned profile**
Balances (`ach_points_balance`, `ach_gems_balance`,
`ach_diamonds_balance`) are the canonical source for affordability
checks across the SDK — compare against `entry_fee_amount` (clans),
`registration_cost_points` / `_gems` / `_diamonds` (tournaments), and
`price` / `discounted_price` + `purchase_type` (store items).
`ach_points_ever` is monotonic — store purchases deduct from
`ach_points_balance` but NEVER from `ach_points_ever`, so it remains
useful for level-progress math (`required_points` on the next
`getLevels` entry minus `ach_points_ever`). `ach_level_current_id`
is the FK into the level ladder — resolve metadata via
`getCurrentLevel` (richer, includes progress %) or
`getLevels` (full ladder lookup table).

**Inbox unread count** — `core_inbox_unread_count` on this profile
is push-updated in real time (under 1 second). For an inbox badge,
prefer this field over `getInboxUnreadCount` (which is cached
for 30 s) — same value, fresher signal.

**Language**: `core_user_language` reflects the server's stored
language. If the consumer just called `_smartico.changeLanguage(...)`,
the field may briefly lag the local intent until the server push
arrives. Use `_smartico.getPublicProps()` for the
client-fallback-applied version if instant accuracy matters.

**Idempotency / Side effects**: trivially safe — no network call,
no state mutation.

**UI guidance**: see [UI Guide — `getUserProfile`](../../docs/ui/user/UIGuide_getUserProfile.md).

**Visitor mode**: not supported — throws. Visitor sessions do not
have a public-profile snapshot.

## Example
```ts
// Wait for identify before calling.
window._smartico.on('identify', (errCode) => {
  if (errCode !== 0) return;
  const profile = window._smartico.api.getUserProfile();
  console.log('[smartico] initial profile loaded — render the user widget:', profile);
});

// Stay in sync with live updates.
window._smartico.on('props_change', (changed) => {
  // `changed` is the partial keys for this push (full snapshot at identify).
  const profile = window._smartico.api.getUserProfile();
  console.log('[smartico] profile updated — re-render any widgets bound to:', Object.keys(changed),
    '— balances now:', profile.ach_points_balance, profile.ach_gems_balance, profile.ach_diamonds_balance);

  // React to specific fields.
  if ('ach_level_current_id' in changed) {
    console.log('[smartico] level changed — call getCurrentLevel() for richer detail, animate the level badge');
  }
  if ('core_inbox_unread_count' in changed) {
    console.log('[smartico] inbox unread count changed — update the badge to:', profile.core_inbox_unread_count);
  }
});

// Affordability gating example — used inside a clan / tournament / store CTA handler.
const profile = window._smartico.api.getUserProfile();
const item = await window._smartico.api.getStoreItems().then(items => items[0]);
const price = item.discounted_price ?? item.price;
const balance = {
  points: profile.ach_points_balance,
  gems: profile.ach_gems_balance,
  diamonds: profile.ach_diamonds_balance,
}[item.purchase_type];
if (balance < price) {
  console.log('[smartico] insufficient', item.purchase_type, '— disable Buy and show deficit', price - balance);
}
```

### Example response (REAL shape)
```json
{
  "core_public_tags": [
    "SMARTICO.DEV"
  ],
  "ach_points_ever": 690,
  "core_clan_is_kicked": null,
  "user_last_session_push_state": "BLOCKED",
  "aff_referred_by_friend_ext_user_id": null,
  "core_inbox_unread_count": 0,
  "core_user_language": "EN",
  "ach_level_current": "Silver",
  "ach_gems_balance": 0,
  "ach_level_current_id": 698,
  "user_country": "BG",
  "ach_points_balance": 326,
  "core_registration_date": 0,
  "core_recommended_deposit_amount": 0,
  "core_recommended_casino_bet_amount": 0,
  "ach_gamification_in_control_group": false,
  "core_avatar_real_id": null,
  "core_wallet_currency": "UNKNOWN",
  "ach_diamonds_balance": 1,
  "aff_refer_friend_url": null,
  "acc_bonus_abuser": false,
  "aff_refered_friends_count": 0,
  "core_clan_kicked_out_id": null,
  "core_clan_id": "",
  "core_is_test_account": false,
  "user_id": 361368543,
  "avatar_id": "https://cdn.example/avatars/12/00000000-0000-0000-0000-000000000000.png",
  "avatar_real_id": 12,
  "public_username": "Antonio",
  "avatar_url": "https://cdn.example/avatars/12/00000000-0000-0000-0000-000000000000.png"
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getLevels`
- `getCurrentLevel`
