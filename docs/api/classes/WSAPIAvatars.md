# Class: WSAPIAvatars
## Methods

### getAvatarsList()

> **getAvatarsList**(): `Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

Returns the list of avatars available in the catalog for the current user.
The response includes both free avatars and earned/purchased ones.
Avatars with `hide_until_achieved = true` and `is_given = false` should be hidden from the user.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarsList().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarDefinition`](../interfaces/TAvatarDefinition.md)[]\>

***

### getAvatarsCustomized()

> **getAvatarsCustomized**(): `Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

Returns the list of AI-customized avatars for the current user.
Each entry represents a previously generated AI customization for a specific base avatar.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarsCustomized().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarCustomized`](../interfaces/TAvatarCustomized.md)[]\>

***

### getAvatarPrompts()

> **getAvatarPrompts**(): `Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

Returns the list of AI customization prompts (styles) available for avatar customization.
Each prompt represents a visual style that can be applied to a base avatar.
The result is cached for 30 seconds.

**Example**:
```
_smartico.api.getAvatarPrompts().then((result) => {
     console.log(result);
});
```

**Visitor mode: not supported**

#### Returns

`Promise`\<[`TAvatarPrompt`](../interfaces/TAvatarPrompt.md)[]\>

***

### setAvatar()

> **setAvatar**(`props`): `Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

Sets the specified avatar as the active avatar for the current user.
Pass `avatar_url` (the `TAvatarDefinition.url` path or a CDN URL for AI-customized avatars)
and `avatar_real_id` from the avatar catalog.
After a successful call, the avatar list cache is cleared so the next `getAvatarsList()` call reflects `is_in_use`.

**Example**:
```
_smartico.api.getAvatarsList().then((avatars) => {
     const avatar = avatars.find((a) => !a.hide_until_achieved || a.is_given);
     if (avatar) {
         _smartico.api.setAvatar({
             avatar_url: avatar.url,
             avatar_real_id: avatar.avatar_real_id,
         }).then((result) => {
             console.log(result);
         });
     }
});
```

**Visitor mode: not supported**

#### Parameters

##### props

###### avatar_url

`string`

###### avatar_real_id

`number`

#### Returns

`Promise`\<[`TSetAvatarResult`](../interfaces/TSetAvatarResult.md)\>

***
