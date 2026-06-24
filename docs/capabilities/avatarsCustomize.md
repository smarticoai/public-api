# avatarsCustomize — API (AvatarCustomizeResponse)

> Generates an AI-customized variant of a base avatar by applying an operator-defined style prompt, returning the CDN URL of the result.
> Import: `import { AvatarCustomizeResponse } from '@smartico/public-api'`
> Search terms: avatarsCustomize, avatars, AvatarCustomizeResponse

## Signature
```ts
_smartico.api.avatarsCustomize(props: {
		user_id: number;
		prompt_id: number;
		avatar_url: string;
		avatar_real_id: number;
	}): Promise<AvatarCustomizeResponse>
```

## Parameters
- `props.user_id` — Numeric Smartico user ID.
- `props.prompt_id` — Style-prompt ID (`prompt_id`) from `getAvatarPrompts`.
- `props.avatar_url` — CDN URL of the base avatar to customize.
- `props.avatar_real_id` — `avatar_real_id` of the base avatar.

## Returns — `Promise<AvatarCustomizeResponse>`
`AvatarCustomizeResponse` (shape from the type — capture a response into `_responses/` for a real example):
- `cdn_url` (string) — CDN URL of the generated avatar variant. Present on success.
- `errCode` (AvatarCustomizeErrorCode | number) — Error code. Present on failure. Typed values are members of `AvatarCustomizeErrorCode`; `-1` is a generic failure. See the `avatarsCustomize` TSDoc for the full table.
- `errMessage` (string) — Optional error message. Present on failure; the generic (`-1`) message is fixed text, so branch on `errCode`, not this string.

## Behavioral contract
**Preconditions**
- Authenticated session required; not available in visitor mode (throws).
- All five fields are mandatory — the SDK throws synchronously
 (`Error("<field> is required")`) if any is missing or zero.
- `prompt_id` must be one of the prompts from `getAvatarPrompts`;
 `avatar_url` / `avatar_real_id` identify the base avatar to style.

**Cost**
Each generation costs the currency the operator configured on the
chosen prompt (points, gems, or diamonds — some prompts are free; read
`cost_currency_type_id` / `cost_value` from the `getAvatarPrompts`
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
`getAvatarsCustomized` cache so the next call surfaces the new
variant. The user's active avatar is unchanged until you call
`setAvatar` with the returned `cdn_url`.

**Idempotency**: not idempotent — each successful call generates (and
charges for) a new variant. Guard the call site against double-clicks.

**UI guidance**: see [UI Guide — `avatarsCustomize`](../../docs/ui/avatars/UIGuide_avatarsCustomize.md).

**Visitor mode**: not supported (throws).

## Example
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

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `setAvatar`
- `getAvatarPrompts`
- `getAvatarsCustomized`
- `AvatarCustomizeResponse`
