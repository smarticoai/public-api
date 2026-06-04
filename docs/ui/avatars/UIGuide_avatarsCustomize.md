# UI Guide — `avatarsCustomize`

## Overview
- A **paid, generate-only** AI step: it applies an operator-defined style
  prompt to a base avatar and returns a `cdn_url` for the generated image.
- It does **not** change the user's active avatar. Activation is a second,
  explicit step — call `setAvatar({ avatar_url: cdn_url, avatar_real_id })`.
- Synchronous and slow (~5–20 s). No SDK cache, no push.

## Flow (the default Smartico UI)
1. **Pick a base avatar** from the avatar catalogue (`getAvatarsList()` /
   `getAvatarsCustomized()`), then open the "Customize" panel.
2. **Pick a style prompt** from `getAvatarPrompts()`. Each prompt carries its
   cost (`cost_currency_type_id` + `cost_value`); render the price on the
   prompt tile and pre-disable prompts the user can't afford (compare against
   the balances on `getUserProfile()`).
3. **Generate.** On tap, call `avatarsCustomize(...)`. Immediately enter a
   loading state (see below) and lock the prompt list + Generate button.
4. **Preview.** On success, render `cdn_url` as a preview. The user can keep
   browsing previously generated variants (they live in the customization
   history surfaced by `getAvatarsCustomized()`).
5. **Apply (explicit).** Only when the user taps "Apply" do you call
   `setAvatar(...)` with the currently-selected URL (which may be the new
   `cdn_url`, a history item, or the untouched base avatar).

## Loading state
- The generation blocks for several seconds. Show a spinner/skeleton in the
  preview slot for the full duration; keep the modal open.
- Disable the Generate trigger and the prompt list while in flight — there is
  no SDK-side debounce, so a second tap fires a second (charged) generation.

## Cost gating
- Read `cost_currency_type_id` (`0` points · `1` gems · `2` diamonds · `3`
  free) and `cost_value` from the chosen `getAvatarPrompts()` entry.
- `cost_value === 0` (or type `3`) is free.
- Gate before calling: if the user can't afford the prompt, disable the tile
  and show the price; don't rely on the server to be the only guard
  (insufficient balance comes back as the generic `-1`).

## Error / limit handling
| Result | UI |
|---|---|
| `cdn_url` set | Success. Render the preview; enable "Apply". |
| `errCode === 12001` | User hit their **monthly per-user cap**. Show e.g. "You've used all your custom avatars this month." Nothing was charged. |
| `errCode === 12002` | The **brand's monthly pool** is exhausted. Show "Custom avatars are unavailable right now — try again later." Nothing was charged. |
| `errCode === -1` | Generic failure (insufficient balance, unavailable prompt, generation error). Show a retryable error; nothing was charged. `errMessage` is fixed text — don't surface it as the reason. |

Both monthly caps are operator-configured and reset at the start of each
calendar month.

## Important behavioral caveats
- **Generation is irreversible and counts toward the monthly caps on success
  — even if the user never applies it.** Don't auto-generate on hover/scroll;
  require an explicit tap.
- **Apply uses the currently-selected image**, which may be the new variant, a
  history item, or the base avatar. Track selection explicitly so "Apply"
  sends the right URL.
- After a successful generation the SDK refreshes the
  `getAvatarsCustomized()` cache, so the new variant appears in the history
  list on the next call.

## Empty / unavailable states
- No prompts returned by `getAvatarPrompts()` → hide the Customize entry point.
- `12002` for the whole brand → consider hiding/greying the Customize entry
  point until next month rather than letting every tap fail.

## Visitor mode
- Not supported — `avatarsCustomize` throws in visitor mode. Hide the
  customization surface for unauthenticated sessions.
