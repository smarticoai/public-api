# Class: WSAPIGeneral
## Methods

### getCustomSections()

> **getCustomSections**(): `Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

#### Returns

`Promise`\<[`TUICustomSection`](../interfaces/TUICustomSection.md)[]\>

***

### getTranslations()

> **getTranslations**(`lang_code`): `Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

Requests translations for the given language. Returns the object including translation key/translation value pairs. All possible translation keys defined in the back office.

#### Parameters

##### lang\_code

`string`

#### Returns

`Promise`\<[`TGetTranslations`](../interfaces/TGetTranslations.md)\>

***

### getRelatedItemsForGame()

> **getRelatedItemsForGame**(`related_game_id`): `Promise`\<[`GetRelatedAchTourResponse`](../interfaces/GetRelatedAchTourResponse.md)\>

Returns all the related tournaments and missions for the provided game id for the current user
The provided Game ID should correspond to the ID from the Games Catalog - https://help.smartico.ai/welcome/technical-guides/games-catalog-api

**Example**:
```
_smartico.api.getRelatedItemsForGame('gold-slot2').then((result) => {
     console.log(result);
});
```

**Example in the Visitor mode**:
```
_smartico.vapi('EN').getRelatedItemsForGame('gold-slot2').then((result) => {
     console.log(result);
});
```

#### Parameters

##### related\_game\_id

`string`

#### Returns

`Promise`\<[`GetRelatedAchTourResponse`](../interfaces/GetRelatedAchTourResponse.md)\>

***
