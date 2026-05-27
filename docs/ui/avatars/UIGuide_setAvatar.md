# UI Guide — `setAvatar`

## Overview
- Activates the chosen avatar as the user's profile avatar.
- Confirmation-style mutation — user picks an avatar in
  [`getAvatarsList`](../../api/classes/WSAPIAvatars.md#getavatarslist)
  (or a variant from
  [`getAvatarsCustomized`](../../api/classes/WSAPIAvatars.md#getavatarscustomized)),
  then taps "Apply".
- Server validates ownership — locked avatars are rejected.
- The SDK clears both the catalog and the customized-variant caches on
  return; re-call those methods to surface the new `is_in_use` state.

## Loading state

User taps "Apply" → the button enters an in-flight state (spinner +
disabled). The default Smartico UI keeps the picker open during the
call and closes it after the response lands.

```ts
const [applying, setApplying] = useState(false);

const onApply = async (avatar: TAvatarDefinition) => {
  if (applying) return;
  setApplying(true);
  const r = await window._smartico.api.setAvatar({
    avatar_url:     avatar.avatar_url,
    avatar_real_id: avatar.avatar_real_id,
  });
  setApplying(false);
  handleResult(r);
};
```

## Idempotency guard

The SDK does NOT prevent double-clicks. Guard the call site as above.
Re-applying the same avatar is safe server-side (returns `err_code: 0`,
no double side-effects), but the redundant roundtrip wastes the user's
time.

## Action button decision matrix

UI behavior per `err_code`:

| `err_code` | Action |
|---|---|
| `0` (success) | Close picker; refresh header avatar; show brief "Avatar updated" confirmation (optional). |
| `1` (not in catalog) | Refresh catalog (operator may have removed the avatar); show "Avatar no longer available". |
| `2` (inactive) | Show "This avatar is no longer available"; refresh catalog. |
| `3` (outside time window) | Show "Available on {active_from_date} – {active_till_date}". |
| `4` (not owned) | Show unlock requirement / "Earn this avatar first" — possible if the catalog was stale. Refresh and re-render lock states. |
| Other non-zero | Show generic error toast. Surface `err_message` if present. Allow retry. |

The default Smartico UI shows a hardcoded "Failed to apply avatar" toast
on any non-zero code without branching. Custom UIs should branch on the
code and prefer `err_message` when present.

## Refresh after success

- The SDK auto-clears the
  [`getAvatarsList`](../../api/classes/WSAPIAvatars.md#getavatarslist)
  and
  [`getAvatarsCustomized`](../../api/classes/WSAPIAvatars.md#getavatarscustomized)
  caches.
- The user's stored avatar updates server-side; the next call to
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile)
  reflects the new `avatar_url`.
- **No push to other open sessions.** A second device / tab the user is
  logged in on will not see the change until it next calls
  `getUserProfile()` or re-identifies. If you maintain a persistent
  header avatar across tabs, plan a periodic refresh.

## Selecting the right `avatar_url`

| Source | Pass as `avatar_url` |
|---|---|
| Catalog avatar (from `getAvatarsList`) | `avatar.avatar_url` |
| AI variant (from `getAvatarsCustomized`) | `variant.url` |

For both, pass the base `avatar_real_id` — for an AI variant, that is
the `avatar_real_id` of the base avatar the variant was derived from
(it's already on the `TAvatarCustomized` record).

## Animations / transitions

Success sequence (default Smartico UI):

1. Apply tap → spinner replaces button label.
2. On `err_code === 0` → picker closes, header avatar fades to new
   image.
3. Optional: brief toast "Avatar updated" auto-dismissing after ~2 s.

Failure sequence:

1. Apply tap → spinner replaces button label.
2. On non-zero `err_code` → spinner clears; error toast shown; picker
   remains open so the user can pick a different avatar.

## Mobile vs desktop

- **Picker**: full-screen sheet on mobile; centered modal on desktop.
- **Apply button**: bottom bar on mobile; bottom-right of modal on
  desktop.
- **Toast**: bottom-center on mobile; top-right on desktop.

## Empty / no-selection state

The "Apply" button should be disabled until the user selects an avatar.
While selected avatar is the user's current one, the button label
becomes "In Use" and stays disabled.

## Performance

- Single round-trip.
- No optimistic update — wait for `err_code === 0` before flipping the
  header avatar. Locked-avatar rejection is real and would otherwise
  produce a visible flicker.
