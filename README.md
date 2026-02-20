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

See the [API documentation](docs/api/classes/WSAPI.md) for all available methods and returning data.

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

```typescript
import { SmarticoAPI } from '@smartico/public-api';

const SAPI = new SmarticoAPI( 'your-label-api-key', 'your-brand-key', 'your-message-sender', { logger: console });

const userExtId = 'John1984'
            
const response = await SAPI.miniGamesGetTemplates(userExtId);

response.templates.forEach( t => {
    console.log(t.saw_template_ui_definition.name)
}

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