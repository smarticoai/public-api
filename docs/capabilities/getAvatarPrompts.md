# getAvatarPrompts — API (TAvatarPrompt)

> Returns the catalog of AI style prompts available for avatar customization.
> Import: `import { TAvatarPrompt } from '@smartico/public-api'`
> Search terms: getAvatarPrompts, avatars, TAvatarPrompt, prompt_id, name, icon_url, cost_currency_type_id, cost_value

## Signature
```ts
_smartico.api.getAvatarPrompts(): Promise<TAvatarPrompt[]>
```

## Parameters
_None._

## Returns — `Promise<TAvatarPrompt[]>`
Array of `TAvatarPrompt`. Each item:
- `prompt_id` (number) — Stable numeric identifier of the prompt.
- `name` (string) — Display name of the style, e.g. "Cartoon", "Watercolor".
- `icon_url` (string) — Absolute CDN URL of the prompt's preview icon.
- `cost_currency_type_id` (number) — Currency used to pay for the customization. `0` = points, `1` = gems, `2` = diamonds, `3` = free. A `cost_value` of `0` is also free.
- `cost_value` (number) — Cost amount in the currency named by `cost_currency_type_id`. `0` = free.

## Behavioral contract
**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- No other prerequisite calls. The customization UI typically calls this on demand
 when the user opens the style picker, not on app boot.

**Cost handling**
Each prompt declares `cost_currency_type_id` (0 = points, 1 = gems, 2 = diamonds)
and `cost_value` (amount). The deduction happens server-side inside the
`avatar-customize` HTTP POST (the AI generation request, which is NOT part of this
SDK). The client should compare `cost_value` against the live balance from
`getUserProfile` to disable prompts the user cannot afford, but the server is
the source of truth and will reject under-funded requests authoritatively.

**Refresh**
- The SDK caches results for 30 seconds.
- Not invalidated by `setAvatar` (prompts are catalog metadata, independent
 of the user's active avatar).
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarPrompts`](../../docs/ui/avatars/UIGuide_getAvatarPrompts.md).

## Example
```ts
const [prompts, profile] = await Promise.all([
    window._smartico.api.getAvatarPrompts(),
    window._smartico.api.getUserProfile(),
]);

for (const p of prompts) {
    // The consumer reads the matching balance from profile based on
    // p.cost_currency_type_id (0=points, 1=gems, 2=diamonds).
    console.log('[smartico] prompt', p.name, '— cost', p.cost_value, 'currency_type', p.cost_currency_type_id);
}
```

### Example response (REAL shape)
```json
[
  {
    "prompt_id": 1,
    "name": "Crown",
    "icon_url": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1776958855960-1.webp",
    "cost_currency_type_id": 0,
    "cost_value": 1
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getUserProfile`
- `setAvatar`
- `TAvatarPrompt`
