# getAvatarsList — API (TAvatarDefinition)

> Returns the avatar catalog available to the current user — every pre-defined avatar configured for the label, with per-user unlock flags (`is_given`, `is_in_use`) applied server-side.
> Import: `import { TAvatarDefinition } from '@smartico/public-api'`
> Search terms: getAvatarsList, avatars, getAvatars, TAvatarDefinition, avatar_real_id, is_default, hide_until_achieved, priority, description, url, avatar_url, avatar_source_type_id

## Signature
```ts
_smartico.api.getAvatarsList(): Promise<TAvatarDefinition[]>
```

## Parameters
_None._

## Returns — `Promise<TAvatarDefinition[]>`
Array of `TAvatarDefinition`. Each item:
- `avatar_real_id` (number) — Stable numeric identifier of the avatar. Primary key passed to `setAvatar()`.
- `is_default` (boolean) — True when this is the system default avatar for the label.
- `hide_until_achieved` (boolean) — When true and `is_given === false`, the avatar should be hidden from the user (surprise unlock).
- `priority` (number) — Display position; lower = earlier in the grid.
- `description` (string) — Optional description shown alongside the avatar in detail views.
- `url` (string) — Raw image path as returned by the server (relative or absolute).
- `avatar_url` (string) — Absolute CDN URL of the avatar image; built from the configured avatar domain + `url`.
- `avatar_source_type_id` (number) — Source type. `0` = free / always available; non-zero = earned or purchased.
- `is_given` (boolean) — True when the user owns / has unlocked this avatar.

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- No other prerequisite calls.

**Visibility filter** (consumer-applied)
Avatars with `hide_until_achieved === true && is_given === false` should be filtered
out of the grid — they represent surprise unlocks that should remain hidden until
the user earns them. The default Smartico UI drops these before rendering.

**Lock state** (consumer-applied)
Lock condition: `!is_given && avatar_source_type_id !== 0`. Free avatars
(`avatar_source_type_id === 0`) are always selectable; non-free avatars are locked
until `is_given` flips to true (operator grants via campaign, mission reward, store
purchase, etc.).

**Sort order**
Server does NOT pre-sort. Caller must sort by `priority` ascending (lower = first).

**Refresh**
- The SDK caches results for 30 seconds.
- `setAvatar` clears this cache on completion; the next call re-fetches.
- No push subscription — there is no `onUpdate` callback for avatar methods.
- When `is_given` flips server-side (e.g. the user earns a new avatar), the change
 surfaces only on the next call after the 30-second cache window expires.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarsList`](../../docs/ui/avatars/UIGuide_getAvatarsList.md).

## Example
```ts
const avatars = await window._smartico.api.getAvatarsList();

// Apply the standard visibility filter and sort.
const visible = avatars
    .filter((a) => !a.hide_until_achieved || a.is_given)
    .sort((a, b) => a.priority - b.priority);

console.log('[smartico] visible avatars:', visible.length, '— render as a grid');

const active = visible.find((a) => a.is_in_use);
if (active) {
    console.log('[smartico] currently in use — overlay a checkmark on this card:', active.avatar_real_id);
}
```

### Example response (REAL shape)
```json
[
  {
    "avatar_real_id": 1,
    "is_default": false,
    "hide_until_achieved": false,
    "priority": 1,
    "description": "The Pink toast cat, in space, leaving rainbow trails. What else do you need?",
    "url": "https://cdn.example/83109b74be861920197eb8-cat-space.gif",
    "avatar_url": "https://cdn.example/83109b74be861920197eb8-cat-space.gif",
    "avatar_source_type_id": 7,
    "is_given": false
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getAvatarsCustomized`
- `setAvatar`
- `TAvatarDefinition`
