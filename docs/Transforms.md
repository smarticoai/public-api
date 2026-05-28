# Transform functions — raw protocol → friendly types

The SDK talks to the Smartico backend over a low-level WebSocket protocol (the
raw request/response messages documented in the Native Protocol doc, `docs/native/PROTOCOL.md`).
Those raw messages are shaped for the wire, not for application developers —
they nest display fields inside `public_meta` / `*PublicMeta` objects, mix
camelCase and snake_case, carry opaque numeric type ids, JSON-encode some
values as strings, and include wire-only fields a UI never needs.

Rather than hand all that to the consumer, the SDK runs a **transform function**
over every response, producing a clean, consistently-shaped, friendly object.
This is why `_smartico.api.*` returns pleasant `T`-prefixed types instead of
the raw protocol shapes.

## The three naming conventions

You'll see this pattern repeated across every domain:

| Convention | Where | Meaning |
|---|---|---|
| **`T`-prefixed types** (`TStoreItem`, `TAvatarDefinition`, `TClanInfo`, `TMissionOrBadge`, …) | `WSAPITypes.ts` + domain folders | The **friendly** result type returned to the consumer. The `T` distinguishes it from the raw protocol type of the same name (`StoreItem`, `AvatarDefinition`, …). |
| **`*Transform` functions** (`StoreItemTransform`, `avatarDefinitionTransform`, `clanTournamentPlayersTransform`, …) | `src/<Domain>/*.ts` | Pure functions that map one raw protocol entity to its friendly `T` type. ~30 of them, one per entity. |
| **`*T` methods** (`storeGetItemsT`, `avatarsGetListT`, `clansGetListT`, …) | `SmarticoAPI` | The "**T**ransformed" variant of a protocol call: send the raw request, then run the matching transform on the response. The `_smartico.api.*` surface is built on these. |

**As a consumer you never call transforms directly** — `_smartico.api.*`
already returns the transformed `T` types. The transforms are the SDK internals
that produce them. (They are exported from the package, so you *can* reference
them, but you rarely need to.)

## What a transform actually does

Transforms normalize the raw shape in a handful of recurring ways:

1. **Flatten nested metadata** — raw entities bury display fields inside a
   `public_meta` / `*PublicMeta` sub-object; the transform lifts them to the
   top level. (`item.itemPublicMeta.name` → `item.name`.)
2. **Normalize casing** — raw fields are inconsistently camelCase
   (`userId`, `userAltName`, `isMe`, `canBuy`); the friendly types are
   consistent snake_case (`user_id`, `public_username`, `is_me`, `can_buy`).
3. **Compute convenience fields** — e.g. build an absolute `avatar_url` from a
   relative image path plus the label's avatar domain, so the consumer can use
   it directly in an `<img>`.
4. **Resolve opaque ids to named values** — numeric type ids become named enum
   values (e.g. a raw `itemTypeId` becomes a friendly `type`).
5. **Parse string-encoded JSON** — fields the server sends as JSON strings
   (e.g. `custom_data`) are parsed into real objects.
6. **Drop wire-only / internal fields and junk rows** — the friendly type keeps
   only what a UI needs.

## Before / after example

Raw `AvatarDefinition` on the wire (`GET_AVATARS_LIST_RESPONSE`):

```json
{
  "avatar_real_id": 7,
  "priority": 2,
  "public_meta": { "description": "Knight", "url": "avatars/knight.png" },
  "avatar_source_type_id": 0,
  "is_given": true,
  "is_in_use": false
}
```

Friendly `TAvatarDefinition` returned by `_smartico.api.getAvatarsList()`:

```json
{
  "avatar_real_id": 7,
  "priority": 2,
  "description": "Knight",
  "url": "avatars/knight.png",
  "avatar_url": "https://<avatar-domain>/avatars/knight.png",
  "avatar_source_type_id": 0,
  "is_given": true,
  "is_in_use": false
}
```

The transform flattened `public_meta.description` / `public_meta.url` to the top
level and added the computed absolute `avatar_url`.

Casing normalization is most visible in clan-tournament players — the raw
`players[]` use `userId` / `userAltName` / `isMe`, which the transform renames
to `user_id` / `public_username` / `is_me`.

## Why this matters for native clients

Native clients (Kotlin / Swift) that speak the WebSocket protocol directly —
see the Native Protocol doc (`docs/native/PROTOCOL.md`) — receive the **raw**
shapes, not the transformed `T` types. PROTOCOL.md documents those raw shapes precisely
(nested `public_meta`, camelCase player fields, etc.) and flags where the JS SDK
adds a computed field (such as `avatar_url`). A native client is responsible for
doing the equivalent normalization itself if it wants the friendlier shape.

In short:

- **JS / browser SDK** → call `_smartico.api.*`, get friendly `T` types (transforms applied for you).
- **Native client** → use the raw protocol from PROTOCOL.md, apply your own mapping.
