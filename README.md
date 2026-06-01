# Smartico Public API
API allows you to build custom Gamification UI using smartico.ai as a backend system.


```
Please contact your Smartico account manager to get the API keys
and for terms of API usage
```



## Front-end usage

To use the API you need the smartico.js library installed and initialized on your site according to this guide https://help.smartico.ai/welcome/technical-guides/front-end-integration

As soon as the **_smartico** object is available in the global context of the browser window and the user is identified, you can call API methods to get the data or act on behalf of the logged-in user.

```javascript

_smartico.api.getLevels().then( levels => {
    console.log('There are ' + levels.length + ' levels available');
});

```

Some methods can be called with onUpdate callback, which is executed when there are changes in the underlying data.
Example:

```javascript

var miniGamesUpdates = (games) => {
    console.log('There are ' + games.length + ' games available now');
}

_smartico.api.getMiniGames( { onUpdate: miniGamesUpdates} ).then( games => {
    console.log('There are ' + games.length + ' games available');
});

```

## The `_smartico` object

Beyond `_smartico.api.*`, the global `_smartico` object exposes core methods for initialization, user identity, language, deep links, embedding widgets, and push — `_smartico.init(...)`, `_smartico.online(...)`, `_smartico.dp(...)`, `_smartico.showWidget(...)`, etc.

See the [**`_smartico` object reference**](docs/SmarticoObject.md) for the most important core methods, their arguments, and usage notes.

## Event callbacks

Beyond the `_smartico.api.*` request/response methods, the SDK emits lifecycle and engagement events (user identified, balance changed, gamification widget opened, mini-game won, jackpot hit, …). Subscribe with `_smartico.on('<event>', handler)`:

```javascript

_smartico.on('props_change', (props) => {
    console.log('User properties changed', props);
});

```

See the [**Event callbacks reference**](docs/Callbacks.md) for the full list of events, when each fires, and the handler arguments.

## API reference

The SDK surface is split across one class per feature area, joined by an internal inheritance chain. Consumers always call `_smartico.api.<methodName>(...)` — the chain is an implementation detail; never import the domain classes directly.

| Domain | Reference | Methods | UI Guides |
|---|---|---|---|
| **User / Profile / Levels** | [`WSAPIUser`](docs/api/classes/WSAPIUser.md) | `getUserProfile`, `checkSegmentMatch`, `checkSegmentListMatch`, `getLevels`, `getCurrentLevel`, `getUserLevelExtraCounters`, `getActivityLog` | [`getUserProfile`](docs/ui/user/UIGuide_getUserProfile.md) · [`getLevels`](docs/ui/user/UIGuide_getLevels.md) · [`getActivityLog`](docs/ui/user/UIGuide_getActivityLog.md) |
| **General / Utility** | [`WSAPIGeneral`](docs/api/classes/WSAPIGeneral.md) | `getCustomSections`, `getTranslations`, `getRelatedItemsForGame` | [`getCustomSections`](docs/ui/general/UIGuide_getCustomSections.md) · [`getRelatedItemsForGame`](docs/ui/general/UIGuide_getRelatedItemsForGame.md) |
| **Missions & Badges** | [`WSAPIMissions`](docs/api/classes/WSAPIMissions.md) | `getMissions`, `getBadges`, `getAchCategories`, `requestMissionOptIn`, `requestMissionClaimReward` | [`getMissions`](docs/ui/missions/UIGuide_getMissions.md) · [`getBadges`](docs/ui/missions/UIGuide_getBadges.md) · [`getAchCategories`](docs/ui/missions/UIGuide_getAchCategories.md) · [`requestMissionOptIn`](docs/ui/missions/UIGuide_requestMissionOptIn.md) · [`requestMissionClaimReward`](docs/ui/missions/UIGuide_requestMissionClaimReward.md) |
| **Bonuses** | [`WSAPIBonuses`](docs/api/classes/WSAPIBonuses.md) | `getBonuses`, `claimBonus` | [`getBonuses`](docs/ui/bonuses/UIGuide_getBonuses.md) · [`claimBonus`](docs/ui/bonuses/UIGuide_claimBonus.md) |
| **Store / Shop** | [`WSAPIStore`](docs/api/classes/WSAPIStore.md) | `getStoreItems`, `buyStoreItem`, `getStoreCategories`, `getStorePurchasedItems` | [`getStoreItems`](docs/ui/store/UIGuide_getStoreItems.md) · [`buyStoreItem`](docs/ui/store/UIGuide_buyStoreItem.md) · [`getStoreCategories`](docs/ui/store/UIGuide_getStoreCategories.md) · [`getStorePurchasedItems`](docs/ui/store/UIGuide_getStorePurchasedItems.md) |
| **Tournaments** | [`WSAPITournaments`](docs/api/classes/WSAPITournaments.md) | `getTournamentsList`, `getTournamentInstanceInfo`, `registerInTournament`, `getClanTournamentPlayers` | [`getTournamentsList`](docs/ui/tournaments/UIGuide_getTournamentsList.md) · [`getTournamentInstanceInfo`](docs/ui/tournaments/UIGuide_getTournamentInstanceInfo.md) · [`registerInTournament`](docs/ui/tournaments/UIGuide_registerInTournament.md) · [`getClanTournamentPlayers`](docs/ui/tournaments/UIGuide_getClanTournamentPlayers.md) |
| **Clans** | [`WSAPIClans`](docs/api/classes/WSAPIClans.md) | `getClans`, `getClanInfo`, `joinClan` | [`getClans`](docs/ui/clans/UIGuide_getClans.md) · [`getClanInfo`](docs/ui/clans/UIGuide_getClanInfo.md) · [`joinClan`](docs/ui/clans/UIGuide_joinClan.md) |
| **Jackpots** | [`WSAPIJackpots`](docs/api/classes/WSAPIJackpots.md) | `jackpotGet`, `jackpotOptIn`, `jackpotOptOut`, `getJackpotWinners`, `getJackpotEligibleGames` | [`jackpotGet`](docs/ui/jackpots/UIGuide_jackpotGet.md) · [`jackpotOptIn`](docs/ui/jackpots/UIGuide_jackpotOptIn.md) · [`jackpotOptOut`](docs/ui/jackpots/UIGuide_jackpotOptOut.md) · [`getJackpotWinners`](docs/ui/jackpots/UIGuide_getJackpotWinners.md) · [`getJackpotEligibleGames`](docs/ui/jackpots/UIGuide_getJackpotEligibleGames.md) |
| **Raffles / Draws** | [`WSAPIRaffles`](docs/api/classes/WSAPIRaffles.md) | `getRaffles`, `getRaffleDrawRun`, `getRaffleDrawRunsHistory`, `claimRafflePrize`, `requestRaffleOptin`, `getRaffleWonPrizes` | [`getRaffles`](docs/ui/raffles/UIGuide_getRaffles.md) · [`getRaffleDrawRun`](docs/ui/raffles/UIGuide_getRaffleDrawRun.md) · [`getRaffleDrawRunsHistory`](docs/ui/raffles/UIGuide_getRaffleDrawRunsHistory.md) · [`claimRafflePrize`](docs/ui/raffles/UIGuide_claimRafflePrize.md) · [`requestRaffleOptin`](docs/ui/raffles/UIGuide_requestRaffleOptin.md) · [`getRaffleWonPrizes`](docs/ui/raffles/UIGuide_getRaffleWonPrizes.md) |
| **MiniGames / SAW** | [`WSAPIMiniGames`](docs/api/classes/WSAPIMiniGames.md) | `getMiniGames`, `getMiniGamesHistory`, `playMiniGame`, `miniGameWinAcknowledgeRequest`, `playMiniGameBatch` | [`getMiniGames`](docs/ui/minigames/UIGuide_getMiniGames.md) · [`getMiniGamesHistory`](docs/ui/minigames/UIGuide_getMiniGamesHistory.md) · [`playMiniGame`](docs/ui/minigames/UIGuide_playMiniGame.md) · [`playMiniGameBatch`](docs/ui/minigames/UIGuide_playMiniGameBatch.md) |
| **Avatars** | [`WSAPIAvatars`](docs/api/classes/WSAPIAvatars.md) | `getAvatarsList`, `getAvatarsCustomized`, `getAvatarPrompts`, `setAvatar` | [`getAvatarsList`](docs/ui/avatars/UIGuide_getAvatarsList.md) · [`getAvatarsCustomized`](docs/ui/avatars/UIGuide_getAvatarsCustomized.md) · [`getAvatarPrompts`](docs/ui/avatars/UIGuide_getAvatarPrompts.md) · [`setAvatar`](docs/ui/avatars/UIGuide_setAvatar.md) |
| **Game Pick (sports / quiz)** | [`WSAPIGamePick`](docs/api/classes/WSAPIGamePick.md) | `gamePickGet*`, `gamePickSubmit*` (9 methods) | [`gamePickGetActiveRounds`](docs/ui/gamepick/UIGuide_gamePickGetActiveRounds.md) · [`gamePickGetActiveRound`](docs/ui/gamepick/UIGuide_gamePickGetActiveRound.md) · [`gamePickGetHistory`](docs/ui/gamepick/UIGuide_gamePickGetHistory.md) · [`gamePickGetBoard`](docs/ui/gamepick/UIGuide_gamePickGetBoard.md) · [`gamePickSubmitSelection`](docs/ui/gamepick/UIGuide_gamePickSubmitSelection.md) · [`gamePickSubmitSelectionQuiz`](docs/ui/gamepick/UIGuide_gamePickSubmitSelectionQuiz.md) · [`gamePickGetUserInfo`](docs/ui/gamepick/UIGuide_gamePickGetUserInfo.md) · [`gamePickGetGameInfo`](docs/ui/gamepick/UIGuide_gamePickGetGameInfo.md) · [`gamePickGetRoundInfoForUser`](docs/ui/gamepick/UIGuide_gamePickGetRoundInfoForUser.md) |
| **Leaderboard** | [`WSAPILeaderBoard`](docs/api/classes/WSAPILeaderBoard.md) | `getLeaderBoard` | [`getLeaderBoard`](docs/ui/leaderboard/UIGuide_getLeaderBoard.md) |
| **Inbox / Messages / Engagement** | [`WSAPIInbox`](docs/api/classes/WSAPIInbox.md) | `getInboxMessages`, `getInboxUnreadCount`, `getInboxMessageBody`, `markInboxMessageAsRead`, `markAllInboxMessagesAsRead`, `markUnmarkInboxMessageAsFavorite`, `deleteInboxMessage`, `deleteAllInboxMessages`, `reportImpressionEvent`, `reportClickEvent` | [`getInboxMessages`](docs/ui/inbox/UIGuide_getInboxMessages.md) · [`getInboxMessageBody`](docs/ui/inbox/UIGuide_getInboxMessageBody.md) · [`markInboxMessageAsRead`](docs/ui/inbox/UIGuide_markInboxMessageAsRead.md) · [`markUnmarkInboxMessageAsFavorite`](docs/ui/inbox/UIGuide_markUnmarkInboxMessageAsFavorite.md) · [`deleteInboxMessage`](docs/ui/inbox/UIGuide_deleteInboxMessage.md) |

The shared return / param types live in [`WSAPITypes`](docs/api/classes/WSAPITypes.md). For the full type / enum / interface listing, see [`docs/api/globals.md`](docs/api/globals.md).

These friendly `T`-prefixed types (`TStoreItem`, `TAvatarDefinition`, …) are produced by the SDK's **transform functions**, which normalize the raw WebSocket protocol shapes into a cleaner form. See [**Transform functions**](docs/Transforms.md) for the concept and naming conventions (`T`-types, `*Transform` functions, `*T` methods).

### Where to look for working examples

The class reference pages above describe **API behavior** — preconditions, error codes, refresh semantics, cache, idempotency, side effects, visitor mode. They do not include long-form UI prescriptions.

For runnable, copy-pasteable widget code, the canonical reference is [**expo.smartico.ai**](https://expo.smartico.ai/widgets/intro). Each widget there is a complete React component built against this SDK — read it, fork it, adapt it. The expo site is where to start when you're building a new widget from scratch.

The "UI Guides" column in the table above links to per-method prescriptive guidance for the most heavily-used flows (Missions, Store) — list bucketing, card and detail layouts, action-button decision matrices, image specs, status-specific visual treatments, animations. Use these alongside the expo examples when you need finer guidance on edge cases (locked / missed / recurring missions, multi-currency store items, claim-window expiration, etc.). More UI guides will be added per domain over time.

See [expo.smartico.ai](https://expo.smartico.ai/widgets/intro) for the open-source examples of using the API as React-based components. Available examples:

* [User profile](https://expo.smartico.ai/widgets/user) — display user gamification info (points, level, badges)
* [Mini-games](https://expo.smartico.ai/widgets/mini_games) — show list of mini-games and trigger a mini-game with a deep link
* [Prize history](https://expo.smartico.ai/widgets/prize_history) — show user's mini-game prize history
* [Missions](https://expo.smartico.ai/widgets/missions) — list missions, opt-in, and claim rewards
* [Store](https://expo.smartico.ai/widgets/store) — display store items and categories, handle purchases
* [Tournaments](https://expo.smartico.ai/widgets/tournaments) — show tournament lobby and registration
* [Inbox](https://expo.smartico.ai/widgets/inbox) — inbox messages with read/delete/favorite actions
* [Custom Level Map](https://expo.smartico.ai/widgets/api_custom_lvl_map) — build a custom level progression map
* [Custom mini-game via API](https://expo.smartico.ai/widgets/dp_custom_mini_game) — implement a fully custom mini-game using the API
* [Custom mini-game example](https://expo.smartico.ai/widgets/dp_custom_mini_game_example) — working example of a custom mini-game
* [Jackpots](https://expo.smartico.ai/jackpots/jp_intro) — jackpot opt-in, custom win animation, multi-jackpot
* [Raffles](https://expo.smartico.ai/raffles/raffle_intro) — raffle draws, prizes, and draw history
* [UI Widgets](https://expo.smartico.ai/ui_widgets/dp_ui_widgets) — pre-built UI widgets for mini-games, leaderboard, store, missions, badges, tournaments, levels, and jackpots

## Visitor mode

You can also get gamification data for the visitors (not authorized users). 

Calls to the methods look similar, with the only exception that you need to use **_smartico.vapi('EN')** method to get access to the Visitor API object with a specific language.

**Note: please contact your Success Manager on the Smartico side to enable Visitor mode**

```javascript

_smartico.vapi('EN').getLevels().then( levels => {
    console.log('There are ' + levels.length + ' levels available');
});

```

See [expo.smartico.ai/visitor_api](https://expo.smartico.ai/visitor_api/visitor_api_intro) for open-source examples of the Visitor API:

* [Missions](https://expo.smartico.ai/visitor_api/visitor_api_missions) — display missions available for visitors
* [Tournaments](https://expo.smartico.ai/visitor_api/visitor_api_tournaments) — show tournament lobby for non-authenticated users
* [Store](https://expo.smartico.ai/visitor_api/visitor_api_store) — display store items before user login
* [Custom levels map](https://expo.smartico.ai/visitor_api/visitor_api_custom_lvl_map) — build a custom level map for visitors

## Using in Native apps (iOS/Android)

Smartico supports integration with native iOS and Android applications via a WebSocket-based protocol and a Native Bridge for WebView communication.

### General integration guide

See the full integration guide: [iOS/Android clients integration guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide)

### Connection flow

1. Establish a WebSocket connection to the Smartico API endpoint
2. Send `INIT` (cid: 3) → receive `INIT_RESPONSE` (cid: 4)
3. Send `IDENTIFY` (cid: 5) → receive `IDENTIFY_RESPONSE` (cid: 6)
4. Send `LOGIN` (cid: 7) → receive `LOGIN_RESPONSE` (cid: 11)
5. Session is active — call any API methods (missions, store, mini-games, tournaments, etc.)
6. Maintain connection with PING/PONG keepalive
7. Listen for server-initiated events (popups, mini-game triggers, deep links, property changes)

### Gamification widget & popups

The `IDENTIFY_RESPONSE` returns `native_app_gf_url` and `native_app_popup_url` — use these to load gamification and engagement content in a WebView. The native app communicates with loaded web pages through the Native Bridge interface (`SmarticoBridge`).

### Push notifications

Register push tokens via WebSocket (cid: 1003) or via HTTP POST/GET to the Smartico public endpoint. See the [integration guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration/ios-android-clients-integration-guide) for details on reporting delivery, impression, and click events.

### Protocol reference

For the full low-level protocol specification including all API methods (levels, missions, store, mini-games, tournaments, leaderboard, inbox, jackpots, raffles, etc.) and server-initiated events, see [Native Protocol](docs/native/PROTOCOL.md).

## Backend usage (NodeJS context)

Note: access to the server-to-server API is not provided by default and is a topic for a separate agreement with Smartico.
We recommend using a front-end API approach in most cases.

### Installation

```bash
npm install --save @smartico/public-api
```

### Usage

`WSAPI` provides a high-level interface on top of `SmarticoAPI`. Create a `SmarticoAPI` instance with a custom `messageSender`, then create `WSAPI` instances bound to specific users:

```typescript
import { SmarticoAPI, WSAPI } from '@smartico/public-api';

// publicApiUrl is resolved automatically by SmarticoAPI from your label key
const messageSender = async (message: any, publicApiUrl?: string): Promise<any> => {
    const res = await fetch(publicApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
    });
    return res.ok ? res.json() : '';
};

const smarticoApi = new SmarticoAPI('your-label-api-key', 'your-brand-key', messageSender);

const userExtId = 'John1984';
const api = new WSAPI(smarticoApi, userExtId);

const missions = await api.getMissions();
missions.forEach(m => {
    console.log(m.name, m.is_completed);
});

const optInResult = await api.requestMissionOptIn(missions[0].id);
console.log('Opt-in:', optInResult.err_code);
```

For the full list of available methods, see the [API reference](#api-reference) section above.

You can also use `SmarticoAPI` directly for low-level protocol access:

```typescript
const response = await smarticoApi.miniGamesGetTemplates(userExtId);
response.templates.forEach(t => {
    console.log(t.saw_template_ui_definition.name);
});
```

## Backend usage (http-protocol)

You can make HTTP calls to the Smartico public endpoint to interact with user data server-to-server — for example, to check if a specific user belongs to segment(s).

> **Note:** Usage of backend-based integration is subject to rate limits and additional charges. High/intensive usage may degrade performance of your client setup. Please contact your Smartico account manager for pricing details based on your expected request volume.

### What you will need

- **Endpoint** — has the form `https://imgX.smr.vc/s2s-api`, where `X` corresponds to your environment ID (ask your account manager)
- **Label public API key**
- **Brand public API key**

### Example: check segment membership

This example checks whether a user belongs to specific segments. It corresponds to `checkSegmentListMatch` (cid: 161 / response cid: 162) described in [Native Protocol](docs/native/PROTOCOL.md).

**Request:**

```bash
curl --location 'https://imgX.smr.vc/s2s-api' \
--header 'Content-Type: application/json' \
--data '{
  "api_key": "your-label-public-api-key",
  "brand_key": "your-brand-public-api-key",
  "ext_user_id": "your-user-ext-id",
  "cid": 161,
  "uuid": "f07f0730-4886-4135-81b7-62c94659d3cf",
  "ts": 1770278728317,
  "segment_id": [
    6493, 1234
  ]
}'
```

**Response:**

```json
{
    "segments": [
        {
            "segment_id": 6493,
            "is_matching": true
        },
        {
            "segment_id": 1234,
            "is_matching": false
        }
    ],
    "errCode": 0,
    "errMsg": "",
    "cid": 162,
    "ts": 1770303940950,
    "uuid": "f07f0730-4886-4135-81b7-62c94659d3cf"
}
```

### Using other API methods

You can call any API method described in [Native Protocol](docs/native/PROTOCOL.md) using the same HTTP approach. Build the request body with the appropriate `cid` and method-specific fields, along with `api_key`, `brand_key`, `ext_user_id`, `uuid`, and `ts`. The response will follow the same structure documented for each method.

## For Smartico developers

### Publishing process

```sh
git commit
npm run build
npm version patch
npm run pub
```

### To debug locally

In the public-api project:

```sh
npm link
# when you are done
npm unlink
```

In the target project
```bash
npm link @smartico/public-api --legacy-peer-deps

# when you are done
npm unlink @smartico/public-api --legacy-peer-deps && npm install @smartico/public-api --legacy-peer-deps
```