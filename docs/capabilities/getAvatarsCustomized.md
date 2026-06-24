# getAvatarsCustomized — API (TAvatarCustomized)

> Returns the user's previously generated AI-customized avatar variants.
> Import: `import { TAvatarCustomized } from '@smartico/public-api'`
> Search terms: getAvatarsCustomized, avatars, TAvatarCustomized, avatar_real_id, url, dt_created

## Signature
```ts
_smartico.api.getAvatarsCustomized(): Promise<TAvatarCustomized[]>
```

## Parameters
_None._

## Returns — `Promise<TAvatarCustomized[]>`
Array of `TAvatarCustomized`. Each item:
- `avatar_real_id` (number) — `avatar_real_id` of the base avatar this variant was generated from.
- `url` (string) — Absolute CDN URL of the AI-generated image. Can be passed as `avatar_url` to `setAvatar()`.
- `dt_created` (number) — Unix-ms timestamp of when the variant was generated.

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- Has meaning only after at least one successful AI customization run (see below).
 New users get an empty array.

**Where customized avatars come from**
AI customization is **not** a WebSocket method on this SDK. It is a separate HTTP
POST to the operator-configured `avatar-customize` endpoint that takes a base avatar
plus a style prompt from `getAvatarPrompts` and returns a generated CDN URL.
Once that POST resolves successfully, the new variant is persisted and surfaces in
the next `getAvatarsCustomized()` call. The variant URL can then be passed to
`setAvatar` to activate it.

**Relation to `getAvatarsList`**
AI variants do NOT appear in `getAvatarsList`. Catalog and variants are two
separate collections — combine them client-side if the UI needs a unified view per
base avatar.

**Sort order**
Server does NOT pre-sort. Caller typically sorts by `dt_created` descending to show
the newest variant first.

**Refresh**
- The SDK caches results for 30 seconds.
- `setAvatar` clears this cache on completion.
- After a successful AI customization POST, the consumer should re-call to surface
 the new variant — the customization endpoint is outside the SDK so the SDK cannot
 auto-invalidate.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarsCustomized`](../../docs/ui/avatars/UIGuide_getAvatarsCustomized.md).

## Example
```ts
const variants = await window._smartico.api.getAvatarsCustomized();

// Group by the base avatar so the UI can show "this base has 3 AI variants".
const byBase = new Map<number, typeof variants>();
for (const v of variants) {
    const list = byBase.get(v.avatar_real_id) ?? [];
    list.push(v);
    byBase.set(v.avatar_real_id, list);
}

// Newest-first within each base.
for (const list of byBase.values()) {
    list.sort((a, b) => b.dt_created - a.dt_created);
}

console.log('[smartico] AI variants by base avatar — render as a carousel under each base');
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "avatar_real_id": 12,
    "url": "https://cdn.example/avatars/12/00000000-0000-0000-0000-000000000000.png",
    "dt_created": 1782248067048
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `TAvatarDefinition`
- `getAvatarsList`
- `getAvatarPrompts`
- `setAvatar`
- `TAvatarCustomized`
