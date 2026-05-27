# UI Guide — `markUnmarkInboxMessageAsFavorite`

## Overview
- Toggles a message's `favorite` (starred) flag. Pass `mark: true`
  to favorite, `mark: false` to unfavorite.
- Returns `{ err_code, err_message }`. `err_code === 0` = success.
- Idempotent — repeat calls with the same `mark` value return
  `err_code === 0` with no-op effect.

## When to call

Inline star-icon click handler on each list row + (optionally) in
the detail view header.

```ts
const onToggleFavorite = async (msg: TInboxMessage) => {
  const target = !msg.favorite;
  console.log('[smartico] optimistically flip star to', target);
  // Update local state first.
  updateLocalList({ ...msg, favorite: target });

  const r = await window._smartico.api.markUnmarkInboxMessageAsFavorite(
    msg.message_guid,
    target,
  );

  if (r.err_code !== 0) {
    // Revert.
    updateLocalList(msg);
    console.error('[smartico] favorite failed, reverting:', r.err_message);
  } else {
    console.log('[smartico] favorite toggle succeeded — show a brief "Added to favorites" / "Removed from favorites" toast');
  }
};
```

## Loading state

Optional. The operation is fast and the icon state itself provides
visible feedback. Many UIs skip a loading state and rely on
optimistic updates.

If you do show a loading state, dim the star icon briefly
(~150 ms) during the in-flight call.

## Optimistic update

Recommended. The server is idempotent and accepts the requested
target value regardless of prior state, so optimistic UI almost
never produces a revert.

## Refresh behavior

- No subscription / push refresh fires for favorite changes.
- The favorite/starred filter (`onlyFavorite: true` on
  [`getInboxMessages`](../../api/classes/WSAPIInbox.md#getinboxmessages))
  reflects the new state on the next call — important for the
  "Favorite" tab.
- After toggling on the All tab, the row's star icon updates
  optimistically. If the user is on the Favorite tab, an
  unfavorited row should be removed from the list (since the
  filter excludes it).

## Error handling

| `err_code` | Action |
|---|---|
| `0` (success) | Keep optimistic star state; show "Added to favorites" / "Removed from favorites" toast. |
| Other non-zero | Revert local star state; show non-blocking error toast with `err_message`. Allow retry. |

## Animations / transitions

- **Star toggle**: scale-pulse (~100 ms) on tap.
- **Color fade**: 150 ms fill color transition (outline → filled
  or vice versa).
- **Tab transition**: when an unfavorited row should disappear
  from the Favorite tab, slide it out (~200 ms) before removing.

## Mobile vs desktop

- **Star visibility**: always visible on mobile; hover-visible on
  desktop (to reduce visual noise on the list).
- **Tap target**: 44×44 px minimum on mobile.
- **Toast position**: mobile bottom; desktop top-right.
