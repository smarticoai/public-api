# Smartico Native Protocol

Protocol documentation for native clients.

This document describes the low-level protocol for communicating with Smartico backend via WebSocket. Each method has a request ClassId and response ClassId that should be used to identify the message type.

---

## Table of Contents

- [Connection Lifecycle](#connection-lifecycle)
  - [Ping / Pong](#ping--pong)
  - [Init](#init)
  - [Identify](#identify)
  - [Login](#login)
  - [Logout](#logout)
- [Common Message Fields](#common-message-fields)

### Server Initiated Messages
- [Overview](#server-initiated-messages)
- [CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT](#client_public_properties_changed_event)
- [CLIENT_ENGAGEMENT_EVENT_NEW](#client_engagement_event_new)
- [RELOAD_ACHIEVEMENTS_EVENT](#reload_achievements_event)
- [SAW_SPINS_COUNT_PUSH](#saw_spins_count_push)
- [SAW_SHOW_SPIN_PUSH](#saw_show_spin_push)
- [JP_WIN_PUSH](#jp_win_push)
- [SAW_PRIZE_DROP_WIN_PUSH](#saw_prize_drop_win_push)
- [CLIENT_EXECUTE_DEEPLINK_EVENT](#client_execute_deeplink_event)
- [CLIENT_EXECUTE_JS_EVENT](#client_execute_js_event)

### API Methods

#### User
- [getUserGamificationInfo](#getusergamificationinfo)
- [checkSegmentListMatch](#checksegmentlistmatch)
- [setAvatar](#setavatar)
- [setCustomUsername](#setcustomusername)

#### Levels
- [getLevels](#getlevels)

#### Missions
- [getMissions](#getmissions)
- [requestMissionOptIn](#requestmissionoptin)
- [requestMissionClaimReward](#requestmissionclaimreward)
- [getAchCategories](#getachcategories)

#### Custom Sections
- [getCustomSections](#getcustomsections)

#### Bonuses
- [getBonuses](#getbonuses)
- [claimBonus](#claimbonus)

#### Store
- [getStoreItems](#getstoreitems)
- [buyStoreItem](#buystoreitem)
- [getStoreCategories](#getstorecategories)
- [getStorePurchasedItems](#getstorepurchaseditems)

#### Mini-Games
- [getMiniGames](#getminigames)
- [playMiniGame](#playminigame)
- [playMiniGameBatch](#playminigamebatch)
- [miniGameWinAcknowledge](#minigamewinacknowledge)
- [getMiniGamesHistory](#getminigameshistory)
- [acknowledgeMiniGameSpinPush](#acknowledgeminigamespinpush)
- [miniGameWinAcknowledgeBatch](#minigamewinacknowledgebatch)
- [prizeDropWinAcknowledge](#prizedropwinacknowledge)

#### Tournaments
- [getTournamentsList](#gettournamentslist)
- [getTournamentInstanceInfo](#gettournamentinstanceinfo)
- [registerInTournament](#registerintournament)

#### Leaderboard
- [getLeaderBoard](#getleaderboard)

#### Inbox
- [getInboxMessages](#getinboxmessages)
- [getInboxUnreadCount](#getinboxunreadcount)
- [getInboxMessageBody](#getinboxmessagebody)
- [markInboxMessageAsRead](#markinboxmessageasread)
- [markAllInboxMessagesAsRead](#markallinboxmessagesasread)
- [markInboxMessageAsFavorite](#markinboxmessageasfavorite)
- [deleteInboxMessage](#deleteinboxmessage)
- [deleteAllInboxMessages](#deleteallinboxmessages)

#### Jackpots
- [getJackpots](#getjackpots)
- [jackpotOptIn](#jackpotoptin)
- [jackpotOptOut](#jackpotoptout)
- [getJackpotWinners](#getjackpotwinners)
- [getJackpotEligibleGames](#getjackpoteligiblegames)
- [getJackpotLatestPots](#getjackpotlatestpots)

#### Engagement Tracking
- [reportEngagementImpression](#reportengagementimpression)
- [reportEngagementAction](#reportengagementaction)
- [reportEngagementFailed](#reportengagementfailed)
- [trackActivity](#trackactivity)

#### Push Notifications
- [registerPushNotificationsToken](#registerpushnotificationstoken)

#### Other
- [getTranslations](#gettranslations)
- [getPointsHistory](#getpointshistory)
- [getRelatedItemsForGame](#getrelateditemsforgame)

#### Raffles
- [getRaffles](#getraffles)
- [getRaffleDrawRun](#getraffledrawrun)
- [getRaffleDrawRunsHistory](#getraffledrawrunshistory)
- [claimRafflePrize](#claimraffleprize)
- [requestRaffleOptin](#requestraffleoptin)

---

# Connection Lifecycle

This section describes the mandatory sequence of messages required to establish a session with the Smartico backend. Native clients **must** implement this flow before calling any API methods.

**Connection flow:**

```
1. Connect to WebSocket
2. Send INIT (cid: 3)       → Receive INIT_RESPONSE (cid: 4)
3. Send IDENTIFY (cid: 5)   → Receive IDENTIFY_RESPONSE (cid: 6)
4. Send LOGIN (cid: 7)      → Receive LOGIN_RESPONSE (cid: 11)
5. Session is now active — API methods can be called
6. Maintain connection with PING/PONG keepalive
7. When user logs out: Send LOGOUT (cid: 8) → Receive LOGOUT_RESPONSE (cid: 12)
```

---

## Ping / Pong

WebSocket keepalive mechanism. The server sends `PING` (cid: 1), the client must respond with `PONG` (cid: 2). Additionally, the client should send a proactive `PING` if no messages are received within **29 seconds** to prevent the connection from being dropped.

**Server → Client:**

```json
{"cid": 1}
```

**Client → Server (response):**

```json
{"cid": 2}
```

> **Implementation note:** When any message is received from the server, reset the keepalive timer. If no messages arrive within 29 seconds, send `{"cid": 1}` proactively.

---

## Init

First message after WebSocket connection is established. Identifies the label (operator) and brand.

### Request

**ClassId:** `3` (INIT)

| Field | Type | Description |
|-------|------|-------------|
| `label_key` | `string` | Public API key for the label |
| `brand_key` | `string` | Brand key (optional, `null` if not used) |
| `device_id` | `string` | Unique device identifier (persisted across sessions) |

**Example:**

```json
{
  "cid": 3,
  "label_key": "your_label_api_key",
  "brand_key": null,
  "device_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response

**ClassId:** `4` (INIT_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (optional) |
| `settings` | `object` | Label settings (key-value map) |
| `products` | `number[]` | Enabled product types for this label |
| `label_id` | `number` | Internal label ID |

**Example:**

```json
{
  "cid": 4,
  "errCode": 0,
  "settings": {
    "PUBLIC_API_URL": "https://api.smartico.ai"
  },
  "products": [1, 2],
  "label_id": 123
}
```

> **Important:** Wait for a successful `INIT_RESPONSE` (errCode: 0) before sending `IDENTIFY`.

---

## Identify

Identifies (authenticates) the user. Must be sent after a successful `INIT`.

### Request

**ClassId:** `5` (IDENTIFY)

| Field | Type | Description |
|-------|------|-------------|
| `ext_user_id` | `string` | External user ID (your system's user identifier) |
| `hash` | `string` | HMAC authentication hash |
| `ua` | `object` | User agent / device information (optional) |

**Example:**

```json
{
  "cid": 5,
  "ext_user_id": "user_12345",
  "hash": "a1b2c3d4e5f6..."
}
```

### Response

**ClassId:** `6` (IDENTIFY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (optional) |
| `user_id` | `number` | Smartico internal user ID |
| `ext_user_id` | `string` | External user ID (echoed back) |
| `public_username` | `string` | User's display name |
| `avatar_id` | `string` | User's current avatar ID |
| `props` | `object` | User's public properties (points, level, balances) |
| `pubic_username_set` | `boolean` | Whether the user has set a custom username |

**Example:**

```json
{
  "cid": 6,
  "errCode": 0,
  "user_id": 98765,
  "ext_user_id": "user_12345",
  "public_username": "Player123",
  "avatar_id": "av_001",
  "props": {
    "ach_points_balance": 1500,
    "ach_level_current": "Silver",
    "ach_points_ever": 5000
  },
  "pubic_username_set": false
}
```

> **Important:** Wait for a successful `IDENTIFY_RESPONSE` (errCode: 0) before sending `LOGIN` or any API methods.

---

## Login

Sent after a successful `IDENTIFY` to report a user login event. Contains optional user-agent metadata.

### Request

**ClassId:** `7` (LOGIN)

| Field | Type | Description |
|-------|------|-------------|
| `payload` | `object` | Optional metadata (user agent info, custom data) |

**Example:**

```json
{
  "cid": 7,
  "payload": {
    "ua_os_name": "iOS",
    "ua_device_type": "mobile",
    "ua_browser": "native"
  }
}
```

### Response

**ClassId:** `11` (LOGIN_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (optional) |

**Example:**

```json
{
  "cid": 11,
  "errCode": 0
}
```

---

## Logout

Logs the user out. After receiving a successful response, the client should forget user data and reconnect if needed.

### Request

**ClassId:** `8` (LOGOUT)

No method-specific fields required.

**Example:**

```json
{
  "cid": 8
}
```

### Response

**ClassId:** `12` (LOGOUT_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (optional) |

**Example:**

```json
{
  "cid": 12,
  "errCode": 0
}
```

> **Recommended action:** On successful logout, clear cached user data and reconnect the WebSocket to start a fresh session.

---

## Common Message Fields

All **request** messages must include the following base fields:

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | ClassId — message type identifier |
| `uuid` | `string` | Unique request identifier (used to match request with response) |
| `ts` | `number` | Timestamp in milliseconds |

All **response** messages include the following base fields:

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | ClassId — message type identifier |
| `uuid` | `string` | Same identifier from the request |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (optional, present when `errCode` != 0) |

> **Note:** These common fields are omitted from individual method descriptions below to avoid duplication. Only method-specific fields are listed.

---

# Server Initiated Messages

Server initiated messages are sent by the server to the client without a prior request. The client should listen for these ClassIds and react accordingly (update UI, show notification, re-fetch data).

Unlike request/response methods, server initiated messages can arrive at any time during an active WebSocket connection.

## Summary

| ClassId | Name | Description |
|---------|------|-------------|
| `108` | CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT | User properties changed (balance, points) |
| `110` | CLIENT_ENGAGEMENT_EVENT_NEW | New inbox message received |
| `504` | RELOAD_ACHIEVEMENTS_EVENT | Achievements/missions data changed |
| `706` | SAW_SPINS_COUNT_PUSH | Spin count updated |
| `707` | SAW_SHOW_SPIN_PUSH | Trigger to show mini-game |
| `808` | JP_WIN_PUSH | Jackpot win notification |
| `708` | SAW_PRIZE_DROP_WIN_PUSH | Prize drop win notification |
| `105` | CLIENT_EXECUTE_DEEPLINK_EVENT | Execute deep link on client |
| `107` | CLIENT_EXECUTE_JS_EVENT | Execute JavaScript on client |

---

## CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT

Sent when user's public properties change (points balance, gems, inbox count, etc.).

**ClassId:** `108`

**Example:**

```json
{
  "cid": 108,
  "props": {
    "core_inbox_unread_count": 3,
    "ach_points_balance": 1500,
    "ach_gems_balance": 25,
    "ach_diamonds_balance": 10
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `props.core_inbox_unread_count` | `number` | Number of unread inbox messages |
| `props.ach_points_balance` | `number` | Current points balance |
| `props.ach_gems_balance` | `number` | Current gems balance |
| `props.ach_diamonds_balance` | `number` | Current diamonds balance |

**Recommended action:** Update UI elements showing user balance or inbox badge.

---

## CLIENT_ENGAGEMENT_EVENT_NEW

Sent when a new engagement event (inbox message) is received.

**ClassId:** `110`

**Example:**

```json
{
  "cid": 110
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |

**Recommended action:** Re-fetch inbox messages using the appropriate API method.

---

## RELOAD_ACHIEVEMENTS_EVENT

Sent when achievements or missions data has changed and needs to be refreshed.

**ClassId:** `504`

**Example:**

```json
{
  "cid": 504
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |

**Recommended action:** Re-fetch missions/achievements data using the appropriate API method.

---

## SAW_SPINS_COUNT_PUSH

Sent when the user's available spin count changes.

**ClassId:** `706`

**Example:**

```json
{
  "cid": 706,
  "saw_template_id": 123,
  "spin_count": 5
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `saw_template_id` | `number` | ID of the mini-game template |
| `spin_count` | `number` | Current number of available spins |

**Recommended action:** Update the spin count badge/counter in UI.

---

## SAW_SHOW_SPIN_PUSH

Sent as a trigger to display a mini-game to the user (Spin-A-Wheel, Scratch Card, Gift Box, etc.).

**ClassId:** `707`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `pending_message_id` | `number` | ID of the pending message that triggered this push |
| `saw_template_id` | `number` | ID of the mini-game template to display |
| `saw_game_type_id` | `number` | Game type: `1` = SpinAWheel, `2` = ScratchCard, `3` = MatchX, `4` = GiftBox, `5` = PrizeDrop, `6` = Quiz, `7` = LootboxWeekdays, `8` = LootboxCalendarDays, `9` = TreasureHunt, `10` = Voyager, `11` = Plinko, `12` = CoinFlip |

**Example:**

```json
{
  "cid": 707,
  "pending_message_id": 456,
  "saw_template_id": 123,
  "saw_game_type_id": 1
}
```

**Recommended action:** Use `saw_template_id` and `saw_game_type_id` to display the appropriate mini-game UI to the user.

---

## JP_WIN_PUSH

Sent when a jackpot is won (can be the current user or another player).

**ClassId:** `808`

**Example:**

```json
{
  "cid": 808,
  "jackpot": {
    "jp_id": 456,
    "name": "Mega Jackpot",
    "current_value": 10000
  },
  "winners": [
    {
      "user_id": "user123",
      "amount": 10000,
      "won_at": 1704067200000
    }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `jackpot` | [`JackpotDetails`](../api/interfaces/JackpotDetails.md) | Jackpot information |
| `winners` | [`JackPotWinner[]`](../api/interfaces/JackPotWinner.md) | Array of winners |

**Recommended action:** Show jackpot win notification/celebration. Re-fetch jackpot data to update UI.

---

## SAW_PRIZE_DROP_WIN_PUSH

Sent when a prize drop is won by the user.

**ClassId:** `708`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `request_id` | `string` | Unique request ID (GUID) |
| `saw_template_id` | `number` | Mini-game template ID |
| `saw_prize` | `object` | Prize details (SAWPrize object) |
| `saw_template` | `object` | Template details (SAWTemplate object) |
| `pending_message_id` | `number` | ID of the pending message |

**Example:**

```json
{
  "cid": 708,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "saw_template_id": 123,
  "saw_prize": { "saw_prize_id": 1, "prize_value": 100 },
  "saw_template": { "saw_template_id": 123, "saw_game_type_id": 5 },
  "pending_message_id": 456
}
```

**Recommended action:** Display prize drop win notification and call `prizeDropWinAcknowledge` to acknowledge.

---

## CLIENT_EXECUTE_DEEPLINK_EVENT

Server-initiated event to execute a deep link on the client.

**ClassId:** `105`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `engagement_uid` | `string` | Engagement unique ID |
| `engagement_id` | `number` | Engagement ID |
| `root_audience_id` | `number` | Root audience ID |
| `payload` | `object` | Contains `dp` field with the deep link URL |

**Example:**

```json
{
  "cid": 105,
  "engagement_uid": "eng-001",
  "engagement_id": 1,
  "root_audience_id": 1,
  "payload": { "dp": "myapp://promotions/summer" }
}
```

**Recommended action:** Report impression via ClassId 103, then navigate to the deep link URL.

---

## CLIENT_EXECUTE_JS_EVENT

Server-initiated event to execute JavaScript code on the client. Native clients should handle this appropriately or ignore.

**ClassId:** `107`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `engagement_uid` | `string` | Engagement unique ID |
| `engagement_id` | `number` | Engagement ID |
| `root_audience_id` | `number` | Root audience ID |
| `script` | `string` | JavaScript code to execute |

**Example:**

```json
{
  "cid": 107,
  "engagement_uid": "eng-001",
  "engagement_id": 1,
  "root_audience_id": 1,
  "script": "console.log('hello')"
}
```

**Recommended action:** Report impression via ClassId 103. For native clients, evaluate if the script can be handled natively or ignore.

---

# API Methods

## User

### getUserGamificationInfo

Get user's gamification data including points, level, balances and counters.

#### Request

**ClassId:** `527` (GET_ACHIEVEMENT_USER_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

**Example:**

```json
{
  "cid": 527,
  "uuid": "abc-123",
  "ts": 1699999999999
}
```

#### Response

**ClassId:** `528` (GET_ACHIEVEMENT_USER_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `points_balance` | `number` | Current points balance |
| `gems_balance` | `number` | Current gems balance |
| `diamonds_balance` | `number` | Current diamonds balance |
| `points_ever` | `number` | Total points ever earned |
| `current_level` | `number` | Current user level ID |
| `level_counter_1` | `number` | Level counter 1 (for advanced leveling) |
| `level_counter_2` | `number` | Level counter 2 (for advanced leveling) |
| `points_board_period_type_1` | `number` | Points for leaderboard period type 1 |
| `points_board_period_type_2` | `number` | Points for leaderboard period type 2 |
| `points_board_period_type_3` | `number` | Points for leaderboard period type 3 |

**Example:**

```json
{
  "cid": 528,
  "uuid": "abc-123",
  "errCode": 0,
  "points_balance": 1500,
  "gems_balance": 50,
  "diamonds_balance": 10,
  "points_ever": 25000,
  "current_level": 5,
  "level_counter_1": 100,
  "level_counter_2": 0,
  "points_board_period_type_1": 500,
  "points_board_period_type_2": 1200,
  "points_board_period_type_3": 3000
}
```

---

### checkSegmentListMatch

Check if the current user belongs to one or more segments. Pass a single ID or multiple IDs in the array.

#### Request

**ClassId:** `161`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `segment_id` | `number[]` | ✓ | Array of segment IDs to check |

**Example:**

```json
{
  "cid": 161,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "segment_id": [1, 2, 3]
}
```

#### Response

**ClassId:** `162`

| Field | Type | Description |
|-------|------|-------------|
| `segments` | [`TSegmentCheckResult[]`](../api/interfaces/TSegmentCheckResult.md) | Array of segment check results |

**Example:**

```json
{
  "cid": 162,
  "errCode": 0,
  "errMsg": null,
  "segments": [
    { "segment_id": 1, "is_matching": true },
    { "segment_id": 2, "is_matching": false },
    { "segment_id": 3, "is_matching": true }
  ]
}
```

---

### setAvatar

Set user's avatar.

#### Request

**ClassId:** `157`

| Field | Type | Description |
|-------|------|-------------|
| `avatar_id` | `string` | Avatar ID to set |
| `skip_change_event` | `boolean` | If true, skips the avatar changed event (optional) |

**Example:**

```json
{
  "cid": 157,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "avatar_id": "av_001"
}
```

#### Response

**ClassId:** `158`

| Field | Type | Description |
|-------|------|-------------|
| `avatar_id` | `string` | Updated avatar ID |

**Example:**

```json
{
  "cid": 158,
  "uuid": "abc-123",
  "errCode": 0,
  "avatar_id": "av_001"
}
```

---

### setCustomUsername

Set user's custom display name.

#### Request

**ClassId:** `159`

| Field | Type | Description |
|-------|------|-------------|
| `public_username_custom` | `string` | Custom username to set |

**Example:**

```json
{
  "cid": 159,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "public_username_custom": "SuperPlayer"
}
```

#### Response

**ClassId:** `160`

| Field | Type | Description |
|-------|------|-------------|
| `public_username_custom` | `string` | Updated custom username |

**Example:**

```json
{
  "cid": 160,
  "uuid": "abc-123",
  "errCode": 0,
  "public_username_custom": "SuperPlayer"
}
```

---

## Levels

### getLevels

Get list of all levels defined in the system.

#### Request

**ClassId:** `500`

**Example:**

```json
{
  "cid": 500,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000
}
```

**Fields:**

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

---

#### Response

**ClassId:** `501`

**Example:**

```json
{
  "cid": 501,
  "errCode": 0,
  "errMsg": null,
  "levels": [
    {
      "level_id": 1,
      "level_public_meta": {
        "name": "Bronze",
        "description": "Starting level",
        "image_url": "https://cdn.example.com/bronze.png"
      },
      "required_points": 0,
      "is_first_level": true,
      "required_level_counter_1": 0,
      "required_level_counter_2": 0,
      "general_level_progress": 0
    },
    {
      "level_id": 2,
      "level_public_meta": {
        "name": "Silver",
        "description": "Second level",
        "image_url": "https://cdn.example.com/silver.png"
      },
      "required_points": 1000,
      "is_first_level": false,
      "required_level_counter_1": 0,
      "required_level_counter_2": 0,
      "general_level_progress": 0
    }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `levels` | [`Level[]`](../api/interfaces/Level.md) | Array of level objects |

---

## Missions

### getMissions

Get all missions and badges for the current user.

> **Note:** This API returns both Missions and Badges. Filter achievements entity by `ach_type_id`  to get only missions (`1`) or only badges (`2`).

#### Request

**ClassId:** `502` (GET_ACHIEVEMENT_MAP_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

**Example:**

```json
{
  "cid": 502,
  "uuid": "abc-123",
  "ts": 1699999999999
}
```

#### Response

**ClassId:** `503` (GET_ACHIEVEMENT_MAP_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `achievements` | [`UserAchievement[]`](../api/interfaces/UserAchievement.md) | Array of achievements (missions + badges) |

**Example:**

```json
{
  "cid": 503,
  "uuid": "abc-123",
  "errCode": 0,
  "achievements": [
    {
      "ach_id": 101,
      "ach_type_id": 1,
      "ach_public_meta": {
        "name": "Daily Login",
        "description": "Login every day for 7 days",
        "image_url": "https://cdn.example.com/mission.png",
        "reward": "100 Points"
      },
      "isCompleted": false,
      "isLocked": false,
      "requiresOptin": false,
      "isOptedIn": true,
      "progress": 42,
      "achievementTasks": [
        {
          "task_id": 201,
          "task_public_meta": {
            "name": "Login Day 1"
          },
          "isCompleted": true,
          "userProgress": 100,
          "executionCount": 1,
          "userExecutedCount": 1
        }
      ]
    }
  ]
}
```

---

### requestMissionOptIn

Opt-in to a mission that requires opt-in.

#### Request

**ClassId:** `525` (MISSION_OPTIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `achievementId` | `number` | Mission ID |

#### Response

**ClassId:** `526` (MISSION_OPTIN_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### requestMissionClaimReward

Claim reward for a completed mission.

#### Request

**ClassId:** `539` (ACHIEVEMENT_CLAIM_PRIZE_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `ach_id` | `number` | Mission ID |
| `ach_completed_id` | `number` | Completion record ID |

#### Response

**ClassId:** `540` (ACHIEVEMENT_CLAIM_PRIZE_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### getAchCategories

Get mission and badge categories.

#### Request

**ClassId:** `537` (GET_ACH_CATEGORIES_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `538` (GET_ACH_CATEGORIES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | [`AchCategory[]`](../api/interfaces/AchCategory.md) | Array of categories |

---

## Custom Sections

### getCustomSections

Get custom UI sections.

#### Request

**ClassId:** `523` (GET_CUSTOM_SECTIONS_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `524` (GET_CUSTOM_SECTIONS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `customSections` | `object` | Map of section ID to [`UICustomSection`](../api/interfaces/UICustomSection.md) |

---

## Bonuses

### getBonuses

Get all bonuses for the current user.

#### Request

**ClassId:** `600` (GET_BONUSES_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

**Example:**

```json
{
  "cid": 600,
  "uuid": "abc-123",
  "ts": 1699999999999
}
```

#### Response

**ClassId:** `601` (GET_BONUSES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `bonuses` | [`Bonus[]`](../api/interfaces/Bonus.md) | Array of bonus objects |

**Example:**

```json
{
  "cid": 601,
  "uuid": "abc-123",
  "errCode": 0,
  "bonuses": [
    {
      "id": 12345,
      "redeemable": true,
      "createDate": "2024-01-15T10:30:00Z",
      "bonusStatusId": 1,
      "labelBonusTemplateMetaMap": {
        "description": "Welcome Bonus",
        "acknowledge": "Claim your bonus!",
        "image_url": "https://cdn.example.com/bonus.png"
      },
      "bonusMetaMap": {
        "uiAmount": "$100"
      }
    }
  ]
}
```

---

### claimBonus

Claim a bonus by its ID.

#### Request

**ClassId:** `602` (CLAIM_BONUS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `bonusId` | `number` | ID of the bonus to claim |

**Example:**

```json
{
  "cid": 602,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "bonusId": 12345
}
```

#### Response

**ClassId:** `603` (CLAIM_BONUS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether the claim was successful |

**Example:**

```json
{
  "cid": 603,
  "uuid": "abc-123",
  "errCode": 0,
  "success": true
}
```

---

## Store

### getStoreItems

Get all available store items.

#### Request

**ClassId:** `509` (GET_SHOP_ITEMS_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `510` (GET_SHOP_ITEMS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `items` | [`StoreItem[]`](../api/interfaces/StoreItem.md) | Array of store items |

---

### buyStoreItem

Purchase a store item.

#### Request

**ClassId:** `511` (BUY_SHOP_ITEM_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `itemId` | `number` | ID of the item to buy |

#### Response

**ClassId:** `512` (BUY_SHOP_ITEM_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### getStoreCategories

Get store categories.

#### Request

**ClassId:** `515` (GET_SHOP_CATEGORIES_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `516` (GET_SHOP_CATEGORIES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | [`StoreCategory[]`](../api/interfaces/StoreCategory.md) | Array of categories |

---

### getStorePurchasedItems

Get user's purchase history.

#### Request

**ClassId:** `541` (ACH_SHOP_ITEM_HISTORY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `limit` | `number` | Max items to return (default 20) |
| `offset` | `number` | Offset for pagination |

#### Response

**ClassId:** `542` (ACH_SHOP_ITEM_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `items` | [`StoreItem[]`](../api/interfaces/StoreItem.md) | Array of purchased items |

---

## Mini-Games

### getMiniGames

Get all available mini-games (spin wheels, scratch cards, etc.).

#### Request

**ClassId:** `700` (SAW_GET_SPINS_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `701` (SAW_GET_SPINS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `templates` | [`SAWTemplate[]`](../api/interfaces/SAWTemplate.md) | Array of mini-game templates |

---

### playMiniGame

Play a mini-game and get prize.

#### Request

**ClassId:** `702` (SAW_DO_SPIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Client-generated unique request ID (GUID) |
| `saw_template_id` | `number` | Mini-game template ID |

**Example:**

```json
{
  "cid": 702,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "saw_template_id": 123
}
```

#### Response

**ClassId:** `703` (SAW_DO_SPIN_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `saw_prize_id` | `number` | Won prize ID |
| `request_id` | `string` | Request ID for acknowledgement |

---

### playMiniGameBatch

Play a mini-game multiple times in a single request.

#### Request

**ClassId:** `712` (SAW_DO_SPIN_BATCH_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `spins` | `array` | Array of spin objects with `request_id` (string) and `saw_template_id` (number) |

#### Response

**ClassId:** `713` (SAW_DO_SPIN_BATCH_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `results` | `SAWDoSpinResponse[]` | Array of spin results |

Each item in `results`:

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Request ID matching the request |
| `saw_prize_id` | `number` | Won prize ID |
| `errCode` | `number` | Error code for this spin (`0` = success) |
| `errMsg` | `string` | Error message (if any) |
| `jackpot_amount` | `number` | Jackpot amount if won jackpot prize (optional) |
| `first_spin_in_period` | `number` | Whether this is the first spin in the period |

#### Example

**Request:**
```json
{
  "cid": 712,
  "uuid": "batch-123",
  "ts": 1699999999999,
  "spins": [
    { "request_id": "spin-1", "saw_template_id": 101 },
    { "request_id": "spin-2", "saw_template_id": 101 },
    { "request_id": "spin-3", "saw_template_id": 101 }
  ]
}
```

**Response:**
```json
{
  "cid": 713,
  "uuid": "batch-123",
  "errCode": 0,
  "results": [
    { "request_id": "spin-1", "saw_prize_id": 10, "errCode": 0, "first_spin_in_period": 1 },
    { "request_id": "spin-2", "saw_prize_id": 5, "errCode": 0, "first_spin_in_period": 0 },
    { "request_id": "spin-3", "saw_prize_id": 10, "errCode": 0, "first_spin_in_period": 0 }
  ]
}
```

---

### miniGameWinAcknowledge

Acknowledge a mini-game win. Should be called after displaying the win result to the user.

#### Request

**ClassId:** `704` (SAW_AKNOWLEDGE_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Request ID from the spin response |

#### Response

**ClassId:** `705` (SAW_AKNOWLEDGE_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### getMiniGamesHistory

Get mini-game play history.

#### Request

**ClassId:** `716` (GET_SAW_HISTORY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `limit` | `number` | Max items to return |
| `offset` | `number` | Offset for pagination |
| `saw_template_id` | `number` | Filter by template ID (optional) |

#### Response

**ClassId:** `717` (GET_SAW_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `prizes` | [`SAWPrizesHistory[]`](../api/interfaces/SAWPrizesHistory.md) | Array of history items |
| `hasMore` | `boolean` | Whether more items are available for pagination |

---

### acknowledgeMiniGameSpinPush

Acknowledge a mini-game spin push. Sent after handling `SAW_SHOW_SPIN_PUSH` (707) to confirm the spin push was processed. Fire-and-forget, no response expected.

#### Request

**ClassId:** `711`

| Field | Type | Description |
|-------|------|-------------|
| `saw_template_id` | `number` | Mini-game template ID |
| `pending_message_id` | `number` | Pending message ID from the push |

**Example:**

```json
{
  "cid": 711,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "saw_template_id": 123,
  "pending_message_id": 456
}
```

---

### miniGameWinAcknowledgeBatch

Acknowledge multiple mini-game wins at once. Used after `playMiniGameBatch`.

#### Request

**ClassId:** `714`

| Field | Type | Description |
|-------|------|-------------|
| `request_ids` | `string[]` | Array of request IDs to acknowledge |

**Example:**

```json
{
  "cid": 714,
  "uuid": "ack-batch-123",
  "ts": 1699999999999,
  "request_ids": ["spin-1", "spin-2", "spin-3"]
}
```

#### Response

**ClassId:** `715`

| Field | Type | Description |
|-------|------|-------------|
| `results` | `array` | Array of acknowledgement results |

Each item in `results`:

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Request ID |
| `errCode` | `number` | Error code for this acknowledgement |
| `errMessage` | `string` | Error message (optional) |

**Example:**

```json
{
  "cid": 715,
  "uuid": "ack-batch-123",
  "errCode": 0,
  "results": [
    { "request_id": "spin-1", "errCode": 0 },
    { "request_id": "spin-2", "errCode": 0 },
    { "request_id": "spin-3", "errCode": 0 }
  ]
}
```

---

### prizeDropWinAcknowledge

Acknowledge a prize drop win. Should be called after receiving `SAW_PRIZE_DROP_WIN_PUSH` (708).

#### Request

**ClassId:** `709`

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Request ID from the prize drop push (GUID) |
| `pending_message_id` | `number` | Pending message ID from the push |
| `claim_required` | `boolean` | Whether claim is required |

**Example:**

```json
{
  "cid": 709,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "pending_message_id": 456,
  "claim_required": false
}
```

#### Response

**ClassId:** `710`

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

## Tournaments

### getTournamentsList

Get all active tournament instances.

#### Request

**ClassId:** `517` (GET_TOURNAMENT_LOBBY_REQUEST)

No method-specific fields. Send only the common fields (see [Common Message Fields](#common-message-fields)).

#### Response

**ClassId:** `518` (GET_TOURNAMENT_LOBBY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `tournaments` | [`Tournament[]`](../api/interfaces/Tournament.md) | Array of tournaments |

---

### getTournamentInstanceInfo

Get detailed information about a tournament instance including leaderboard.

#### Request

**ClassId:** `519` (GET_TOURNAMENT_INFO_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `tournamentInstanceId` | `number` | Tournament instance ID |

#### Response

**ClassId:** `520` (GET_TOURNAMENT_INFO_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `tournamentInfo` | [`GetTournamentInfoResponse.tournamentInfo`](../api/interfaces/GetTournamentInfoResponse.md) | Tournament info with players |
| `userPosition` | [`TournamentPlayer`](../api/interfaces/TournamentPlayer.md) | Current user's position |
| `prizeStructure` | `object` | Prize structure with `prizes` array |

---

### registerInTournament

Register user in a tournament.

#### Request

**ClassId:** `521` (TOURNAMENT_REGISTER_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `tournamentInstanceId` | `number` | Tournament instance ID |

#### Response

**ClassId:** `522` (TOURNAMENT_REGISTER_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

## Leaderboard

### getLeaderBoard

Get leaderboard for a specific period type.

#### Request

**ClassId:** `505` (GET_LEADERS_BOARD_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `period_type_id` | `number` | Period type: `1` = Daily, `2` = Weekly, `3` = Monthly (optional, if not set returns all boards) |
| `snapshot_offset` | `number` | `0` = current period, `1` = previous period, `2` = period before previous, etc. |
| `include_users` | `boolean` | Whether to include user details (optional) |

#### Response

**ClassId:** `506` (GET_LEADERS_BOARD_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `leaders` | [`LeaderBoardUserT[]`](../api/interfaces/LeaderBoardUserT.md) | Array of leaderboard entries |
| `user_position` | `number` | Current user's position |
| `user_points` | `number` | Current user's points |

---

## Inbox

### getInboxMessages

Get user's inbox messages.

#### Request

**ClassId:** `513` (GET_INBOX_MESSAGES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `limit` | `number` | Max messages to return (default 20) |
| `offset` | `number` | Offset for pagination (default 0) |
| `starred_only` | `boolean` | Filter favorites only |
| `category_id` | `number` | Filter by category |
| `read_status` | `number` | Filter by read status |

#### Response

**ClassId:** `514` (GET_INBOX_MESSAGES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `log` | [`InboxMessage[]`](../api/interfaces/InboxMessage.md) | Array of messages |
| `unread_count` | `number` | Total unread count |

---

### markInboxMessageAsRead

Mark an inbox message as read.

#### Request

**ClassId:** `529` (MARK_INBOX_READ_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Message engagement UID |

#### Response

**ClassId:** `530` (MARK_INBOX_READ_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### markInboxMessageAsFavorite

Mark/unmark an inbox message as favorite.

#### Request

**ClassId:** `531` (MARK_INBOX_STARRED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Message engagement UID |
| `is_starred` | `boolean` | `true` to add, `false` to remove |

#### Response

**ClassId:** `532` (MARK_INBOX_STARRED_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### deleteInboxMessage

Delete an inbox message.

#### Request

**ClassId:** `535` (MARK_INBOX_DELETED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Message engagement UID |

#### Response

**ClassId:** `536` (MARK_INBOX_DELETED_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### getInboxUnreadCount

Get unread inbox message count.

> **Note:** This uses the same ClassId as `getInboxMessages`. The unread count is returned in the `unread_count` field of the response. Send a minimal request with `limit: 1` to get the count without fetching all messages.

#### Request

**ClassId:** `513` (GET_INBOX_MESSAGES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `limit` | `number` | Set to `1` (minimal fetch) |
| `offset` | `number` | Set to `0` |

#### Response

**ClassId:** `514` (GET_INBOX_MESSAGES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `unread_count` | `number` | Number of unread messages |

---

### getInboxMessageBody

Get the full body content of an inbox message.

> **Important:** This is NOT a WebSocket call. It's an HTTP GET request to the CDN.

#### HTTP Request

```
GET {INBOX_CDN_URL}/{message_guid}.json
```

#### Response

Returns JSON with full message body content.

---

### markAllInboxMessagesAsRead

Mark all inbox messages as read.

#### Request

**ClassId:** `529` (MARK_INBOX_READ_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `all_read` | `boolean` | Set to `true` |

#### Response

**ClassId:** `530` (MARK_INBOX_READ_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### deleteAllInboxMessages

Delete all inbox messages.

#### Request

**ClassId:** `535` (MARK_INBOX_DELETED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `all_deleted` | `boolean` | Set to `true` |

#### Response

**ClassId:** `536` (MARK_INBOX_DELETED_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

## Jackpots

### getJackpots

Get all available jackpots.

#### Request

**ClassId:** `800` (JP_GET_JACKPOTS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Filter by template ID (optional) |

#### Response

**ClassId:** `801` (JP_GET_JACKPOTS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `items` | [`JackpotDetails[]`](../api/interfaces/JackpotDetails.md) | Array of jackpots |

---

### jackpotOptIn

Opt-in to a jackpot.

#### Request

**ClassId:** `804` (JP_OPTIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `805` (JP_OPTIN_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### jackpotOptOut

Opt-out from a jackpot.

#### Request

**ClassId:** `806` (JP_OPTOUT_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `807` (JP_OPTOUT_RESPONSE)

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### getJackpotWinners

Get jackpot winners history.

#### Request

**ClassId:** `809` (JP_GET_WINNERS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Jackpot template ID |
| `limit` | `number` | Max items to return |
| `offset` | `number` | Offset for pagination |

#### Response

**ClassId:** `810` (JP_GET_WINNERS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `winners` | [`JackpotWinnerHistory[]`](../api/interfaces/JackpotWinnerHistory.md) | Array of winners |

---

### getJackpotEligibleGames

Get games eligible for a specific jackpot.

#### Request

**ClassId:** `811` (JP_GET_ELIGIBLE_GAMES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `812` (JP_GET_ELIGIBLE_GAMES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `eligible_games` | [`AchRelatedGame[]`](../api/interfaces/AchRelatedGame.md) | Array of eligible games |

---

### getJackpotLatestPots

Get latest jackpot pot values for specified templates.

#### Request

**ClassId:** `802`

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_ids` | `number[]` | Array of jackpot template IDs |

**Example:**

```json
{
  "cid": 802,
  "uuid": "pot-123",
  "ts": 1699999999999,
  "jp_template_ids": [1, 2, 3]
}
```

#### Response

**ClassId:** `803`

| Field | Type | Description |
|-------|------|-------------|
| `items` | `JackpotPot[]` | Array of jackpot pot objects |

Each `JackpotPot`:

| Field | Type | Description |
|-------|------|-------------|
| `jp_template_id` | `number` | Jackpot template ID |
| `jp_pot_id` | `number` | Jackpot pot ID |
| `current_pot_amount` | `number` | Current pot amount in base currency |
| `current_pot_amount_user_currency` | `number` | Current pot amount in user's currency |
| `explode_date_ts` | `number` | Timestamp when pot exploded (0 if not yet) |
| `current_pot_temperature` | `number` | Temperature: 0=Cold, 1=Warm, 2=Hot, 3=Burning |

**Example:**

```json
{
  "cid": 803,
  "uuid": "pot-123",
  "errCode": 0,
  "items": [
    {
      "jp_template_id": 1,
      "jp_pot_id": 100,
      "current_pot_amount": 50000,
      "current_pot_amount_user_currency": 50000,
      "explode_date_ts": 0,
      "current_pot_temperature": 2
    }
  ]
}
```

---

## Raffles

### getRaffles

Get list of Raffles available for user.

### Request

**ClassId:** `902`

**Example:**

```json
{
  "cid": 902,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "skip_public_meta": false
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `skip_public_meta` | `boolean` | - | If `true`, response will not include `public_meta` objects (reduces payload size) |

---

### Response

**ClassId:** `903`

**Example:**

```json
{
  "cid": 903,
  "errCode": 0,
  "errMsg": null,
  "items": [
    {
      "raffle_id": 123,
      "public_meta": {
        "name": "Summer Raffle",
        "description": "Win amazing prizes!",
        "custom_section_id": 5,
        "image_url": "https://cdn.example.com/raffle.png",
        "image_url_mobile": "https://cdn.example.com/raffle-mobile.png",
        "hint_text": "Terms and conditions apply",
        "custom_data": "{}"
      },
      "start_date_ts": 1704067200,
      "end_date_ts": 1706745600,
      "max_tickets_count": 10000,
      "current_tickets_count": 4500,
      "draws": [
        {
          "draw_id": 1,
          "run_id": 42,
          "current_state": 1,
          "execution_type": 1,
          "execution_ts": 1704153600,
          "ticket_start_ts": 1704067200,
          "total_tickets_count": 1500,
          "my_tickets_count": 5,
          "user_opted_in": true,
          "requires_optin": false,
          "allow_multi_prize_per_ticket": false,
          "public_meta": {
            "name": "Daily Draw",
            "description": "Daily prize draw",
            "image_url": "https://cdn.example.com/draw.png",
            "is_grand": false
          },
          "prizes": [
            {
              "prize_id": "prize_1",
              "prizes_per_run": 1,
              "prizes_per_run_actual": 1,
              "chances_to_win_perc": 0.33,
              "requires_claim": true,
              "min_required_tickets_for_user": 1,
              "priority": 1,
              "should_claim": false,
              "public_meta": {
                "name": "iPhone 15",
                "description": "Brand new iPhone 15",
                "image_url": "https://cdn.example.com/iphone.png",
                "hide_chance_to_win": false
              },
              "winners": []
            }
          ],
          "my_last_tickets": [
            { "id": 12345, "s": "ABC-12345" },
            { "id": 12346, "s": "ABC-12346" }
          ]
        }
      ]
    }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `items` | [`Raffle[]`](../api/interfaces/Raffle.md) | Array of raffles |

---

### Error Codes

| Code | Description |
|------|-------------|
| `0` | Success |

---

### getRaffleDrawRun

Get detailed information about a specific draw run, including winners.

### Request

**ClassId:** `904`

**Example:**

```json
{
  "cid": 904,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "raffle_id": 123,
  "run_id": 42,
  "winners_limit": 10,
  "winners_offset": 0
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `raffle_id` | `number` | ✓ | ID of the raffle |
| `run_id` | `number` | ✓ | ID of the specific draw run |
| `winners_limit` | `number` | - | Maximum number of winners to return |
| `winners_offset` | `number` | - | Offset for pagination of winners |

---

### Response

**ClassId:** `905`

**Example:**

```json
{
  "cid": 905,
  "errCode": 0,
  "errMsg": null,
  "draw": {
    "draw_id": 1,
    "run_id": 42,
    "current_state": 3,
    "execution_type": 1,
    "execution_ts": 1704153600,
    "ticket_start_ts": 1704067200,
    "total_tickets_count": 1500,
    "my_tickets_count": 5,
    "user_opted_in": true,
    "requires_optin": false,
    "allow_multi_prize_per_ticket": false,
    "winners_total": 3,
    "public_meta": {
      "name": "Daily Draw",
      "description": "Daily prize draw",
      "image_url": "https://cdn.example.com/draw.png",
      "is_grand": false
    },
    "prizes": [
      {
        "prize_id": "prize_1",
        "prizes_per_run": 1,
        "prizes_per_run_actual": 1,
        "chances_to_win_perc": 0,
        "requires_claim": true,
        "min_required_tickets_for_user": 1,
        "priority": 1,
        "should_claim": false,
        "public_meta": {
          "name": "iPhone 15",
          "description": "Brand new iPhone 15",
          "image_url": "https://cdn.example.com/iphone.png",
          "hide_chance_to_win": false
        },
        "winners": [
          {
            "user_id": 12345,
            "public_username": "JohnDoe",
            "avatar_id": "av_001",
            "avatar_url": "https://cdn.example.com/avatars/av_001.png",
            "ticket": { "id": 98765, "s": "WIN-98765" },
            "raf_won_id": 555,
            "claimed_date": 0
          }
        ]
      }
    ],
    "my_last_tickets": [
      { "id": 12345, "s": "ABC-12345" }
    ]
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `draw` | [`RaffleDraw`](../api/interfaces/RaffleDraw.md) | Draw run details with winners |

---

### Error Codes

| Code | Description |
|------|-------------|
| `0` | Success |

---

### getRaffleDrawRunsHistory

Get history of completed draw runs for a specific raffle. Useful for displaying past winners and checking for unclaimed prizes.

### Request

**ClassId:** `906`

**Example:**

```json
{
  "cid": 906,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "raffle_id": 123,
  "draw_id": 1
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `raffle_id` | `number` | ✓ | ID of the raffle |
| `draw_id` | `number` | - | ID of specific draw. If not passed, all draw runs for the raffle will be returned |

---

### Response

**ClassId:** `907`

**Example:**

```json
{
  "cid": 907,
  "errCode": 0,
  "errMsg": null,
  "draw_runs": [
    {
      "draw_id": 1,
      "run_id": 42,
      "public_meta": {
        "name": "Daily Draw",
        "description": "Daily prize draw",
        "image_url": "https://cdn.example.com/draw.png",
        "is_grand": false
      },
      "execution_ts": 1704153600,
      "actual_execution_ts": 1704153605,
      "ticket_start_ts": 1704067200,
      "is_winner": true,
      "has_unclaimed_prize": true
    },
    {
      "draw_id": 1,
      "run_id": 41,
      "public_meta": {
        "name": "Daily Draw",
        "description": "Daily prize draw",
        "image_url": "https://cdn.example.com/draw.png",
        "is_grand": false
      },
      "execution_ts": 1704067200,
      "actual_execution_ts": 1704067205,
      "ticket_start_ts": 1703980800,
      "is_winner": false,
      "has_unclaimed_prize": false
    }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `draw_runs` | [`RaffleDrawRun[]`](../api/interfaces/RaffleDrawRun.md) | Array of historical draw runs |

---

### Error Codes

| Code | Description |
|------|-------------|
| `0` | Success |

---

### claimRafflePrize

Claim a prize won in a raffle draw.

### Request

**ClassId:** `908`

**Example:**

```json
{
  "cid": 908,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "won_id": 555
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `won_id` | `number` | ✓ | ID of the won prize (from `raf_won_id` in RafflePrizeWinner) |

---

### Response

**ClassId:** `909`

**Example:**

```json
{
  "cid": 909,
  "errCode": 0,
  "errMsg": null
}
```

**Fields:**

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

### Error Codes

| Code | Description |
|------|-------------|
| `0` | Success |

---

### requestRaffleOptin

Request opt-in for a specific raffle draw run. Used when a raffle requires explicit user opt-in before participation.

### Request

**ClassId:** `916`

**Example:**

```json
{
  "cid": 916,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "raffle_id": 123,
  "draw_id": 1,
  "raffle_run_id": 42
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `raffle_id` | `number` | ✓ | ID of the raffle |
| `draw_id` | `number` | ✓ | ID of the draw |
| `raffle_run_id` | `number` | ✓ | ID of the specific draw run |

---

### Response

**ClassId:** `917`

**Example:**

```json
{
  "cid": 917,
  "errCode": 0,
  "errMsg": null
}
```

**Fields:**

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

## Engagement Tracking

### reportEngagementImpression

Report that an engagement message was displayed to the user (impression event). Fire-and-forget, no response expected.

#### Request

**ClassId:** `103`

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Engagement unique ID |
| `activityType` | `number` | Activity type from CJMActivityType enum: `20`=Banner, `30`=Popup, `31`=Inbox, `40`=Push |

**Example:**

```json
{
  "cid": 103,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "engagement_uid": "eng-001",
  "activityType": 30
}
```

---

### reportEngagementAction

Report that a user interacted with an engagement message (click/action event). Fire-and-forget, no response expected.

#### Request

**ClassId:** `104`

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Engagement unique ID |
| `activityType` | `number` | Activity type from CJMActivityType enum |
| `action` | `string` | Action identifier (optional) |

**Example:**

```json
{
  "cid": 104,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "engagement_uid": "eng-001",
  "activityType": 30,
  "action": "cta_click"
}
```

---

### reportEngagementFailed

Report that an engagement message failed to display. Fire-and-forget, no response expected.

#### Request

**ClassId:** `106`

| Field | Type | Description |
|-------|------|-------------|
| `engagement_uid` | `string` | Engagement unique ID |
| `activityType` | `number` | Activity type from CJMActivityType enum |
| `action` | `string` | Action that failed (optional) |
| `reason` | `string` | Failure reason (optional) |

**Example:**

```json
{
  "cid": 106,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "engagement_uid": "eng-001",
  "activityType": 30,
  "reason": "render_error"
}
```

---

### trackActivity

Track a client-side analytics activity. Fire-and-forget, no response expected.

#### Request

**ClassId:** `155`

| Field | Type | Description |
|-------|------|-------------|
| `activity_id` | `number` | Activity identifier |
| `view_time_sec` | `number` | View time in seconds (optional) |

**Example:**

```json
{
  "cid": 155,
  "uuid": "abc-123",
  "ts": 1699999999999,
  "activity_id": 1,
  "view_time_sec": 30
}
```

---

## Push Notifications

### registerPushNotificationsToken

Register a push notifications token for the current user. Required for receiving push notifications on native platforms.

#### Request

**ClassId:** `1003`

| Field | Type | Description |
|-------|------|-------------|
| `token` | `string` | Push notification token (FCM token for Android, APNs token for iOS). Set to `null` to unregister. |
| `platform` | `number` | Platform: `6`=NATIVE_IOS, `7`=NATIVE_ANDROID |
| `pushNotificationUserStatus` | `number` | Status: `0`=ALLOWED, `1`=ASK, `2`=BLOCKED, `3`=SUSPENDED |
| `app_package_id` | `string` | Application package ID (e.g. "com.example.app") |

**Example:**

```json
{
  "cid": 1003,
  "uuid": "push-123",
  "ts": 1699999999999,
  "token": "fMI-qkT3...",
  "platform": 7,
  "pushNotificationUserStatus": 0,
  "app_package_id": "com.example.app"
}
```

#### Response

**ClassId:** `2003`

No method-specific fields. Returns only the common response fields (see [Common Message Fields](#common-message-fields)).

---

## Other

### getTranslations

Get UI translations for a specific language.

#### Request

**ClassId:** `13` (GET_TRANSLATIONS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `hash_code` | `number` | Hash code for caching (send `0` on first request) |
| `areas` | `number[]` | Translation areas to fetch (send `[]` for all) |
| `lang_code` | `string` | Language code (e.g., "en", "de", "fr") |

#### Response

**ClassId:** `14` (GET_TRANSLATIONS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `hash_code` | `number` | Hash code (use for subsequent requests to enable caching) |
| `translations` | `object` | Key-value map of translation strings |

#### Example

**Request:**
```json
{
  "cid": 13,
  "uuid": "trans-123",
  "ts": 1699999999999,
  "hash_code": 0,
  "areas": [],
  "lang_code": "en"
}
```

**Response:**
```json
{
  "cid": 14,
  "uuid": "trans-123",
  "errCode": 0,
  "hash_code": 12345,
  "translations": {
    "button.spin": "Spin Now",
    "label.points": "Points",
    "message.welcome": "Welcome!"
  }
}
```

---

### getPointsHistory

Get user's points history.

#### Request

**ClassId:** `545` (GET_POINT_HISTORY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `startTimeSeconds` | `number` | Start time (Unix timestamp in seconds) |
| `endTimeSeconds` | `number` | End time (Unix timestamp in seconds) |
| `limit` | `number` | Max items to return |
| `offset` | `number` | Offset for pagination |

#### Response

**ClassId:** `546` (GET_POINT_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `logHistory` | [`PointsLog[]`](../api/interfaces/PointsLog.md) \| [`GemsDiamondsLog[]`](../api/interfaces/GemsDiamondsLog.md) | Array of points history entries |

#### Example

**Request:**
```json
{
  "cid": 545,
  "uuid": "hist-123",
  "ts": 1699999999999,
  "startTimeSeconds": 1699900000,
  "endTimeSeconds": 1700000000
}
```

**Response:**
```json
{
  "cid": 546,
  "uuid": "hist-123",
  "errCode": 0,
  "logHistory": [
    {
      "create_date": 1699950000,
      "user_ext_id": "user123",
      "crm_brand_id": 1,
      "points_collected": 100,
      "user_points_ever": 5000,
      "user_points_balance": 1500,
      "source_type_id": 1
    }
  ]
}
```

---

### getRelatedItemsForGame

Get missions and tournaments related to a specific game.

#### Request

**ClassId:** `543` (GET_RELATED_ACH_N_TOURNAMENTS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `related_game_id` | `string` | Game ID to find related items for |

#### Response

**ClassId:** `544` (GET_RELATED_ACH_N_TOURNAMENTS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `achievements` | `array` | Related missions/achievements |
| `tournaments` | `array` | Related tournaments |

#### Example

**Request:**
```json
{
  "cid": 543,
  "uuid": "related-123",
  "ts": 1699999999999,
  "related_game_id": "game-456"
}
```

**Response:**
```json
{
  "cid": 544,
  "uuid": "related-123",
  "errCode": 0,
  "achievements": [
    { "ach_id": 101, "ach_name": "Play 10 rounds" }
  ],
  "tournaments": [
    { "tournament_id": 201, "tournament_name": "Weekend Cup" }
  ]
}
```
