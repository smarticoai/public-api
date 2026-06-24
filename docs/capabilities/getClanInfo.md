# getClanInfo — API (TClanInfo)

> Returns the full detail of a single clan — adds the ranked `members[]` roster and a fresh `cooldown_until` on top of the same fields exposed on a `TClan` list entry.
> Import: `import { TClanInfo } from '@smartico/public-api'`
> Search terms: getClanInfo, clans, TClanInfo, clan_id, public_meta, member_count, capacity_limit, entry_fee_currency_type_id, entry_fee_amount, rating_position, rating_score

## Signature
```ts
_smartico.api.getClanInfo(clanId: number): Promise<TClanInfo>
```

## Parameters
- `clanId` — The clan ID from `TClans.clans[i].clan_id`.

## Returns — `Promise<TClanInfo>`
- `clan_id` (number) — Clan ID.
- `public_meta` (object) — Translated clan metadata (name, description, image URL).
- `member_count` (number) — Current number of members in clan.
- `capacity_limit` (number) — Max number of members allowed in clan.
- `entry_fee_currency_type_id` (number) — Currency type for `entry_fee_amount`. `0` = points, `1` = gems, `2` = diamonds, `3` = free.
- `entry_fee_amount` (number) — Entry fee amount in the currency indicated by `entry_fee_currency_type_id`.
- `rating_position` (number) — Global rank among all active clans in the label, by `rating_score` DESC. `1` = highest-rated.
- `rating_score` (number) — Clan rating score (higher is better).
- `cooldown_until` (null) — User-level switch-cooldown expiry as ISO 8601 UTC string ("YYYY-MM-DDTHH:MM:SS" with no timezone suffix). `null` when no cooldown. Same semantic as `TClans.cooldown_until` but always fresh (the list version may be up to 30 s stale).
- `members` (object[]) — Members of this clan, server-ordered by `contribution_score` DESC (i.e. `position` ASC).
  - `user_id` (number)
  - `public_username` (string)
  - `avatar_id` (string)
  - `avatar_real_id` (null)
  - `avatar_url` (string)
  - `position` (number)
  - `contribution_score` (number)
  - `is_me` (boolean)
  - `clean_ext_user_id` (string)

## Behavioral contract
**Preconditions**
Pass a valid `clanId` (typically read from
`TClans.clans[i].clan_id` returned by `getClans`). The
method works standalone — `getClans()` is not required first —
but is the only stable source of valid IDs.

**Refresh model**
- **No subscription.** One-shot promise.
- **No client cache.** Every call sends a network request.
- **No push event** refreshes the detail. Member-join, kick, or
 contribution-score changes require a fresh `getClanInfo` call.

**Returned shape — beyond `TClan`**
`TClanInfo` adds two things on top of the same identity / capacity
/ fee / rating fields you'd see on a `TClan` list entry:
1. A ranked `members[]` array — each entry carries `user_id`,
 `public_username`, `avatar_id` / `avatar_real_id`, the resolved
 `avatar_url`, the member's `position` (rank within this clan),
 `contribution_score`, the `is_me` flag identifying the current
 user's row, and the optional `clean_ext_user_id`. The server
 orders members by score DESC (i.e. `position` ASC); no
 client-side re-sort is required.
2. A fresh `cooldown_until` on the clan info itself. This is the
 SAME user-level cooldown as `TClans.cooldown_until` (the
 cooldown is global to the user, not per clan) — but `getClans`
 returns a value cached for up to 30 s while `getClanInfo`
 always returns the current value. If the list-cached cooldown
 has just expired, this detail call will reflect it first.

**Username display**: in the default Smartico UI, member rows use
`public_username`. Some surfaces (e.g. the tournament clan
drill-down) prefer `clean_ext_user_id` as the primary display
with `public_username` as fallback — pick the convention that
matches your product's identity model.

**Idempotency**: safe. Read-only.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getClanInfo`](../../docs/ui/clans/UIGuide_getClanInfo.md).

**Visitor mode**: not supported.

## Example
```ts
const result = await window._smartico.api.getClans();
const clan = result.clans[0];

console.log('[smartico] loading detail for clan', clan.clan_id);
const detail = await window._smartico.api.getClanInfo(clan.clan_id);

console.log('[smartico] render detail with', detail.members.length, 'members');

// Find current user's row to power a sticky "me" footer.
const meRow = detail.members.find(m => m.is_me);
if (meRow) {
  console.log('[smartico] current user rank in this clan:', meRow.position,
    'contribution:', meRow.contribution_score, '— render sticky my-member footer');
}

// Resolve Join CTA state using the detail's cooldown (always fresh).
const isMyClan = detail.clan_id === result.user_clan_id;
const inCooldown = detail.cooldown_until != null;
const isFull = detail.member_count >= detail.capacity_limit;
if (isMyClan) {
  console.log('[smartico] this is the user\'s clan — render disabled "Your clan" button');
} else if (inCooldown) {
  const ends = new Date(detail.cooldown_until + 'Z');
  console.log('[smartico] user is in clan-switch cooldown until', ends.toLocaleString(),
    '— render disabled cooldown button');
} else if (isFull) {
  console.log('[smartico] clan is full — render disabled "Clan is full" button');
} else {
  console.log('[smartico] joinable — render enabled Join button');
}
```

### Example response (REAL shape)
```json
{
  "clan_id": 6,
  "public_meta": {
    "name": "Joker Clan",
    "description": "Join the clan if you're a wild card and are completely out of control! Or if you just hate Bruce Wayne very much.\n\nPlay in the tournaments, grab that cash an…",
    "image_url": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1780057181857-1.png"
  },
  "member_count": 884,
  "capacity_limit": 1000,
  "entry_fee_currency_type_id": 0,
  "entry_fee_amount": 100,
  "rating_position": 1,
  "rating_score": 87,
  "cooldown_until": null,
  "members": [
    {
      "user_id": 183751733,
      "public_username": "Daniel",
      "avatar_id": "183751733",
      "avatar_real_id": null,
      "avatar_url": "https://cdn.example/avatar/183751733",
      "position": 1,
      "contribution_score": 450460,
      "is_me": false,
      "clean_ext_user_id": "0"
    },
    {
      "user_id": 339588750,
      "public_username": "Carolyn",
      "avatar_id": "339588750",
      "avatar_real_id": null,
      "avatar_url": "https://cdn.example/avatar/339588750",
      "position": 2,
      "contribution_score": 310342,
      "is_me": false,
      "clean_ext_user_id": "0"
    }
  ]
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getClans`
