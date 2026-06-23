# Class: WSAPIAvatars
## Methods

### getAvatarsList()

> **getAvatarsList**(): `Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

Returns the avatar catalog available to the current user — every pre-defined
avatar configured for the label, with per-user unlock flags (`is_given`, `is_in_use`)
applied server-side.

The returned `avatar_url` is the absolute CDN URL (the SDK prefixes relative paths
with the configured avatar domain). AI-customized variants are NOT returned here —
those live in [getAvatarsCustomized](#getavatarscustomized).

#### Returns

`Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

Array of [TAvatarDefinition](../interfaces/TAvatarDefinition.md) — empty array if the feature is disabled
on the label.

#### Remarks

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
- [setAvatar](#setavatar) clears this cache on completion; the next call re-fetches.
- No push subscription — there is no `onUpdate` callback for avatar methods.
- When `is_given` flips server-side (e.g. the user earns a new avatar), the change
  surfaces only on the next call after the 30-second cache window expires.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarsList`](../_media/UIGuide_getAvatarsList.md).

#### Example

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

***

### getAvatarsCustomized()

> **getAvatarsCustomized**(): `Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

Returns the user's previously generated AI-customized avatar variants.

Each entry is one AI-generated image derived from a base avatar in the catalog
(the base is identified by `avatar_real_id` and was originally a
[TAvatarDefinition](../interfaces/TAvatarDefinition.md) from [getAvatarsList](#getavatarslist)). These variants are stored
server-side under the user record and persist across sessions.

#### Returns

`Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

Array of [TAvatarCustomized](../interfaces/TAvatarCustomized.md) — empty if the user has never run AI
customization, or if the feature is disabled on the label.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- Has meaning only after at least one successful AI customization run (see below).
  New users get an empty array.

**Where customized avatars come from**
AI customization is **not** a WebSocket method on this SDK. It is a separate HTTP
POST to the operator-configured `avatar-customize` endpoint that takes a base avatar
plus a style prompt from [getAvatarPrompts](#getavatarprompts) and returns a generated CDN URL.
Once that POST resolves successfully, the new variant is persisted and surfaces in
the next `getAvatarsCustomized()` call. The variant URL can then be passed to
[setAvatar](#setavatar) to activate it.

**Relation to `getAvatarsList`**
AI variants do NOT appear in [getAvatarsList](#getavatarslist). Catalog and variants are two
separate collections — combine them client-side if the UI needs a unified view per
base avatar.

**Sort order**
Server does NOT pre-sort. Caller typically sorts by `dt_created` descending to show
the newest variant first.

**Refresh**
- The SDK caches results for 30 seconds.
- [setAvatar](#setavatar) clears this cache on completion.
- After a successful AI customization POST, the consumer should re-call to surface
  the new variant — the customization endpoint is outside the SDK so the SDK cannot
  auto-invalidate.
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarsCustomized`](../_media/UIGuide_getAvatarsCustomized.md).

#### Example

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
    list.sort((a, b) => b.dt_created.localeCompare(a.dt_created));
}

console.log('[smartico] AI variants by base avatar — render as a carousel under each base');
```

***

### getAvatarPrompts()

> **getAvatarPrompts**(): `Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

Returns the catalog of AI style prompts available for avatar customization.

Each entry is a "style" the user can apply to a base avatar (e.g. "Cartoon",
"Watercolor", "Cyberpunk"). Prompts carry a cost expressed in points, gems, or
diamonds — applying a prompt deducts the cost server-side as part of the AI
generation request.

#### Returns

`Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

Array of [TAvatarPrompt](../interfaces/TAvatarPrompt.md) — empty if the AI customization feature is
disabled on the label.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- No other prerequisite calls. The customization UI typically calls this on demand
  when the user opens the style picker, not on app boot.

**Cost handling**
Each prompt declares `cost_currency_type_id` (0 = points, 1 = gems, 2 = diamonds)
and `cost_value` (amount). The deduction happens server-side inside the
`avatar-customize` HTTP POST (the AI generation request, which is NOT part of this
SDK). The client should compare `cost_value` against the live balance from
[getUserProfile](WSAPIUser.md#getuserprofile) to disable prompts the user cannot afford, but the server is
the source of truth and will reject under-funded requests authoritatively.

**Refresh**
- The SDK caches results for 30 seconds.
- Not invalidated by [setAvatar](#setavatar) (prompts are catalog metadata, independent
  of the user's active avatar).
- No push subscription.

**Visitor mode**: not supported.

**UI guidance**: see [UI Guide — `getAvatarPrompts`](../_media/UIGuide_getAvatarPrompts.md).

#### Example

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

***

### setAvatar()

> **setAvatar**(`props`): `Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

Activates the specified avatar for the current user. The chosen image becomes the
profile avatar — any subsequent [getUserProfile](WSAPIUser.md#getuserprofile) call will reflect the new
`avatar_url`.

Pass `avatar_url` (a [TAvatarDefinition.url](../interfaces/TAvatarDefinition.md#url) from the catalog or a
[TAvatarCustomized.url](../interfaces/TAvatarCustomized.md#url) from the AI-variant list) plus `avatar_real_id` of the
base avatar. The server validates ownership before applying — locked avatars are
rejected.

#### Parameters

##### props

###### avatar_url

`string`

Absolute CDN URL of the avatar image. Read from
                               [TAvatarDefinition.url](../interfaces/TAvatarDefinition.md#url) for catalog avatars or
                               [TAvatarCustomized.url](../interfaces/TAvatarCustomized.md#url) for AI variants.

###### avatar_real_id

`number`

Numeric ID of the base avatar from
                               [TAvatarDefinition.avatar\_real\_id](../interfaces/TAvatarDefinition.md#avatar_real_id). For AI
                               variants, this is the `avatar_real_id` of the base
                               they were derived from.

#### Returns

`Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

[TSetAvatarResult](../interfaces/TSetAvatarResult.md) — check `err_code === 0` for success.

#### Remarks

**Preconditions**
- User must be authenticated. Visitor mode is not supported.
- `avatar_url` must be non-empty and `avatar_real_id` must be truthy — the SDK
  throws synchronously otherwise (the request never reaches the server).
- The avatar must exist in the catalog from [getAvatarsList](#getavatarslist) (or be an AI
  variant of a base avatar the user already owns). Free avatars
  (`avatar_source_type_id === 0`) and the user's currently active avatar bypass the
  ownership check; all others require `is_given === true`.

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

**Refresh after success**
- The SDK clears both the `getAvatarsList` and `getAvatarsCustomized` caches —
  the next call to either returns fresh data with the new `is_in_use` flag set on
  the chosen avatar.
- The server persists the new avatar URL on the user record; [getUserProfile](WSAPIUser.md#getuserprofile)
  reflects it on the next read in this session.
- **No push to other open sessions.** A second device / tab the user is logged in
  on will not see the new avatar until it next calls [getUserProfile](WSAPIUser.md#getuserprofile) or
  re-identifies. Plan UI accordingly.

**Idempotency**: safe to retry. Re-applying the same `avatar_real_id` returns
`err_code: 0` and produces no double side effects (no double-deduction — this
method does not charge any currency — and no duplicate log entries).

**Side effects**: updates the user's stored `avatar_id` / `avatar_real_id`. Does
NOT cost points, gems, or diamonds — the cost lives on the separate AI
customization HTTP flow ([getAvatarPrompts](#getavatarprompts)). Does NOT write a user-visible
entry to [getActivityLog](#getactivitylog).

**UI guidance**: see [UI Guide — `setAvatar`](../_media/UIGuide_setAvatar.md).

**Visitor mode**: not supported.

#### Example

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

***

### avatarsCustomize()

> **avatarsCustomize**(`props`): `Promise`\<[`AvatarCustomizeResponse`](../interfaces/AvatarCustomizeResponse.md)\>

Generates an AI-customized variant of a base avatar by applying an
operator-defined style prompt, returning the CDN URL of the result.
This is a paid, generate-only step: it does NOT change the user's
active avatar — pass the returned `cdn_url` to [setAvatar](#setavatar) to
activate it.

#### Parameters

##### props

###### user_id

`number`

Numeric Smartico user ID.

###### prompt_id

`number`

Style-prompt ID (`prompt_id`) from [getAvatarPrompts](#getavatarprompts).

###### avatar_url

`string`

CDN URL of the base avatar to customize.

###### avatar_real_id

`number`

`avatar_real_id` of the base avatar.

#### Returns

`Promise`\<[`AvatarCustomizeResponse`](../interfaces/AvatarCustomizeResponse.md)\>

[AvatarCustomizeResponse](../interfaces/AvatarCustomizeResponse.md) — `cdn_url` set on success;
         `errCode` / `errMessage` set on failure.

#### Remarks

**Preconditions**
- Authenticated session required; not available in visitor mode (throws).
- All five fields are mandatory — the SDK throws synchronously
  (`Error("<field> is required")`) if any is missing or zero.
- `prompt_id` must be one of the prompts from [getAvatarPrompts](#getavatarprompts);
  `avatar_url` / `avatar_real_id` identify the base avatar to style.

**Cost**
Each generation costs the currency the operator configured on the
chosen prompt (points, gems, or diamonds — some prompts are free; read
`cost_currency_type_id` / `cost_value` from the [getAvatarPrompts](#getavatarprompts)
entry to gate the UI before calling). The cost is charged only on
success; if the user can't afford it the call fails with `errCode -1`
and nothing is generated or charged.

**Latency**
Generation runs server-side AI image synthesis and is synchronous from
the caller's side — expect several seconds (roughly 5–20 s) before the
promise resolves. There is no SDK cache and no push/subscription; show
a loading state for the full duration and disable the trigger to
prevent duplicate submissions.

**Result & error codes**
On success the result has `cdn_url` set; on failure it has `errCode` /
`errMessage` set and no `cdn_url`. Branch on `errCode` — the generic
message is fixed text, not cause-specific:
- `12001` (`AvatarCustomizeErrorCode.AVATAR_USER_LIMIT`) — the user hit
  their monthly per-user generation cap. Nothing is generated or charged.
- `12002` (`AvatarCustomizeErrorCode.AVATAR_LABEL_LIMIT`) — the brand's
  shared monthly pool is exhausted. Nothing is generated or charged;
  surface a "try again later" message.
- `-1` — generic failure: insufficient balance, an unavailable prompt,
  or a generation error. Nothing is charged. Allow the user to retry.

Both monthly caps are operator-configured and reset at the start of
each calendar month.

**Side effects (on success)**
The generated variant is persisted to the user's customization history
and counts toward the monthly caps **whether or not** it is later
activated — generation is not reversible. The SDK clears the
[getAvatarsCustomized](#getavatarscustomized) cache so the next call surfaces the new
variant. The user's active avatar is unchanged until you call
[setAvatar](#setavatar) with the returned `cdn_url`.

**Idempotency**: not idempotent — each successful call generates (and
charges for) a new variant. Guard the call site against double-clicks.

**UI guidance**: see [UI Guide — `avatarsCustomize`](../_media/UIGuide_avatarsCustomize.md).

**Visitor mode**: not supported (throws).

#### Example

```ts
// user_id identifies the Smartico user being customized.
const prompts = await window._smartico.api.getAvatarPrompts();
const prompt = prompts[0];

console.log('[smartico] generating avatar — show a spinner for ~5-20s and disable the Generate button');
const result = await window._smartico.api.avatarsCustomize({
  user_id,
  prompt_id: prompt.prompt_id,
  avatar_url: baseAvatar.avatar_url,
  avatar_real_id: baseAvatar.avatar_real_id,
});

if (result.cdn_url) {
  console.log('[smartico] generation succeeded — preview this URL, then call setAvatar to apply it:', result.cdn_url);
  // await window._smartico.api.setAvatar({ avatar_url: result.cdn_url, avatar_real_id: baseAvatar.avatar_real_id });
} else if (result.errCode === 12001) {
  console.error('[smartico] user monthly limit reached — show "you have used all your custom avatars this month"');
} else if (result.errCode === 12002) {
  console.error('[smartico] brand monthly pool exhausted — show "custom avatars are unavailable right now, try later"');
} else {
  console.error('[smartico] generation failed (e.g. not enough balance) — let the user retry:', result.errMessage);
}
```

***
