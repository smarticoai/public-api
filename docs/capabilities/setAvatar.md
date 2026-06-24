# setAvatar — API (TSetAvatarResult)

> Activates the specified avatar for the current user.
> Import: `import { TSetAvatarResult } from '@smartico/public-api'`
> Search terms: setAvatar, avatars, TSetAvatarResult, err_code, err_message

## Signature
```ts
_smartico.api.setAvatar(props: { avatar_url: string; avatar_real_id: number }): Promise<TSetAvatarResult>
```

## Parameters
- `props.avatar_url` — Absolute CDN URL of the avatar image. Read from `TAvatarDefinition.url` for catalog avatars or `TAvatarCustomized.url` for AI variants.
- `props.avatar_real_id` — Numeric ID of the base avatar from `TAvatarDefinition.avatar_real_id`. For AI variants, this is the `avatar_real_id` of the base they were derived from.

## Returns — `Promise<TSetAvatarResult>`
`TSetAvatarResult`:
- `err_code` (number) — Error code. `0` = success. See `setAvatar` TSDoc for the full table.
- `err_message` (string) — Optional error message; populated on non-zero `err_code`.

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- `avatar_url` must be non-empty and `avatar_real_id` must be truthy — the SDK
 throws synchronously otherwise (the request never reaches the server).
- The avatar must exist in the catalog from `getAvatarsList` (or be an AI
 variant of a base avatar the user already owns). Free avatars
 (`avatar_source_type_id === 0`) and the user's currently active avatar bypass the
 ownership check; all others require `is_given === true`.



**Refresh after success**
- The SDK clears both the `getAvatarsList` and `getAvatarsCustomized` caches —
 the next call to either returns fresh data with the new `is_in_use` flag set on
 the chosen avatar.
- The server persists the new avatar URL on the user record; `getUserProfile`
 reflects it on the next read in this session.
- **No push to other open sessions.** A second device / tab the user is logged in
 on will not see the new avatar until it next calls `getUserProfile` or
 re-identifies. Plan UI accordingly.

**Idempotency**: safe to retry. Re-applying the same `avatar_real_id` returns
`err_code: 0` and produces no double side effects (no double-deduction — this
method does not charge any currency — and no duplicate log entries).

**Side effects**: updates the user's stored `avatar_id` / `avatar_real_id`. Does
NOT cost points, gems, or diamonds — the cost lives on the separate AI
customization HTTP flow (`getAvatarPrompts`). Does NOT write a user-visible
entry to `getActivityLog`.

**UI guidance**: see [UI Guide — `setAvatar`](../../docs/ui/avatars/UIGuide_setAvatar.md).

**Visitor mode**: not supported.

## Example
```ts
const avatars = await window._smartico.api.getAvatarsList();
const target = avatars.find((a) => a.avatar_real_id === 7);

if (!target) {
    console.error('[smartico] avatar 7 not in catalog — hide the picker entry');
    return;
}

const isLocked = !target.is_given && target.avatar_source_type_id !== 0;
if (isLocked) {
    console.log('[smartico] avatar is locked — show "earn this first" prompt instead of calling setAvatar');
    return;
}

const r = await window._smartico.api.setAvatar({
    avatar_url:     target.avatar_url,
    avatar_real_id: target.avatar_real_id,
});

switch (r.err_code) {
    case 0:
        console.log('[smartico] avatar applied — close picker, refresh header avatar');
        break;
    case 1:
        console.error('[smartico] avatar not in catalog — refresh catalog and show error');
        break;
    case 2:
        console.error('[smartico] avatar inactive — operator disabled it; hide from picker');
        break;
    case 3:
        console.error('[smartico] outside time window — show "available on X" message');
        break;
    case 4:
        console.error('[smartico] not owned — show unlock requirements');
        break;
    default:
        console.error('[smartico] avatar apply failed — show generic error toast:', r.err_message);
}
```

### Example response (REAL shape)
```json
{
  "err_code": 4,
  "err_message": "Avatar is not available"
}
```

## Errors
**Error codes** (in `err_code`)
- `0` — success; cache is cleared and the profile avatar updates immediately.
- `1` — avatar not found in the catalog. The `avatar_real_id` doesn't exist for
 this label.
- `2` — avatar inactive (deactivated by the operator).
- `3` — outside the avatar's active time window
 (`active_from_date` / `active_till_date`).
- `4` — user does not own this avatar (it isn't in their `is_given` set and isn't
 a free / default avatar).
- other non-zero — generic server error; surface `err_message` if present.

The default Smartico UI shows a hardcoded "Failed to apply avatar" toast on any
non-zero `err_code` and does not surface `err_message`. Custom UIs SHOULD branch
on the code and prefer `err_message` when present (it is the localized server
string).

## Related
- `getUserProfile`
- `TAvatarDefinition.url`
- `TAvatarCustomized.url`
- `getAvatarsList`
- `getAvatarPrompts`
- `getActivityLog`
- `TAvatarDefinition.avatar_real_id`
- `TSetAvatarResult`
