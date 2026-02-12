# Smartico Native Protocol

Protocol documentation for native clients.

This document describes the low-level protocol for communicating with Smartico backend via WebSocket. Each method has a request ClassId and response ClassId that should be used to identify the message type.

---

## Table of Contents

### Server Initiated Messages
- [Overview](#server-initiated-messages)
- [CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT](#client_public_properties_changed_event)
- [CLIENT_ENGAGEMENT_EVENT_NEW](#client_engagement_event_new)
- [RELOAD_ACHIEVEMENTS_EVENT](#reload_achievements_event)
- [SAW_SPINS_COUNT_PUSH](#saw_spins_count_push)
- [SAW_SHOW_SPIN_PUSH](#saw_show_spin_push)
- [JP_WIN_PUSH](#jp_win_push)

### API Methods

#### User
- [getUserGamificationInfo](#getusergamificationinfo)
- [checkSegmentMatch](#checksegmentmatch)
- [checkSegmentListMatch](#checksegmentlistmatch)

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

Sent as a trigger to display a mini-game to the user (Spin-A-Wheel, Scratch Card, Slot, etc.).

**ClassId:** `707`

**Example:**

```json
{
  "cid": 707
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |

**Recommended action:** Fetch mini-game templates and display the appropriate game modal/screen.

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

# API Methods

## User

### getUserGamificationInfo

Get user's gamification data including points, level, balances and counters.

#### Request

**ClassId:** `527` (GET_ACHIEVEMENT_USER_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `527` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

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
| `cid` | `number` | `528` |
| `uuid` | `string` | Request identifier (matches request) |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |
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

### checkSegmentMatch

Check if the current user belongs to a specific segment.

#### Request

**ClassId:** `161`

**Example:**

```json
{
  "cid": 161,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "segment_id": [42]
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
| `segment_id` | `number[]` | ✓ | Array with single segment ID |

---

#### Response

**ClassId:** `162`

**Example:**

```json
{
  "cid": 162,
  "errCode": 0,
  "errMsg": null,
  "segments": [
    { "segment_id": 42, "is_matching": true }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
| `segments` | [`TSegmentCheckResult[]`](../api/interfaces/TSegmentCheckResult.md) | Array of segment check results |

---

### checkSegmentListMatch

Check if the current user belongs to multiple segments.

#### Request

**ClassId:** `161`

**Example:**

```json
{
  "cid": 161,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ts": 1704067200000,
  "segment_id": [1, 2, 3]
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
| `segment_id` | `number[]` | ✓ | Array of segment IDs to check |

---

#### Response

**ClassId:** `162`

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

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
| `segments` | [`TSegmentCheckResult[]`](../api/interfaces/TSegmentCheckResult.md) | Array of segment check results |

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |

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
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
| `levels` | [`Level[]`](../api/interfaces/Level.md) | Array of level objects |

---

## Missions

### getMissions

Get all missions and badges for the current user.

> **Note:** This API returns both Missions and Badges. Filter achievements entity by `ach_type_id`  to get only missions (`1`) or only badges (`2`).

#### Request

**ClassId:** `502` (GET_ACHIEVEMENT_MAP_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `502` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

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
| `cid` | `number` | `503` |
| `uuid` | `string` | Request identifier (matches request) |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |
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

---

### requestMissionOptIn

Opt-in to a mission that requires opt-in.

#### Request

**ClassId:** `525` (MISSION_OPTIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `525` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `ach_id` | `number` | Mission ID |

#### Response

**ClassId:** `526` (MISSION_OPTIN_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `526` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |

---

### requestMissionClaimReward

Claim reward for a completed mission.

#### Request

**ClassId:** `539` (ACHIEVEMENT_CLAIM_PRIZE_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `539` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `ach_id` | `number` | Mission ID |
| `ach_completed_id` | `number` | Completion record ID |

#### Response

**ClassId:** `540` (ACHIEVEMENT_CLAIM_PRIZE_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `540` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |

---

### getAchCategories

Get mission and badge categories.

#### Request

**ClassId:** `537` (GET_ACH_CATEGORIES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `537` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `538` (GET_ACH_CATEGORIES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `538` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `categories` | [`AchCategory[]`](../api/interfaces/AchCategory.md) | Array of categories |

---

## Custom Sections

### getCustomSections

Get custom UI sections.

#### Request

**ClassId:** `523` (GET_CUSTOM_SECTIONS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `523` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `524` (GET_CUSTOM_SECTIONS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `524` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `customSections` | `object` | Map of section ID to [`UICustomSection`](../api/interfaces/UICustomSection.md) |

---

## Bonuses

### getBonuses

Get all bonuses for the current user.

#### Request

**ClassId:** `600` (GET_BONUSES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `600` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

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
| `cid` | `number` | `601` |
| `uuid` | `string` | Request identifier (matches request) |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |
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
| `cid` | `number` | `602` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
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
| `cid` | `number` | `603` |
| `uuid` | `string` | Request identifier (matches request) |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |
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

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `509` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `510` (GET_SHOP_ITEMS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `510` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `items` | [`StoreItem[]`](../api/interfaces/StoreItem.md) | Array of store items |

---

### buyStoreItem

Purchase a store item.

#### Request

**ClassId:** `511` (BUY_SHOP_ITEM_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `511` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `itemId` | `number` | ID of the item to buy |

#### Response

**ClassId:** `512` (BUY_SHOP_ITEM_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `512` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |

---

### getStoreCategories

Get store categories.

#### Request

**ClassId:** `515` (GET_SHOP_CATEGORIES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `515` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `516` (GET_SHOP_CATEGORIES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `516` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `categories` | [`StoreCategory[]`](../api/interfaces/StoreCategory.md) | Array of categories |

---

### getStorePurchasedItems

Get user's purchase history.

#### Request

**ClassId:** `541` (ACH_SHOP_ITEM_HISTORY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `541` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `limit` | `number` | Max items to return (default 20) |
| `offset` | `number` | Offset for pagination |

#### Response

**ClassId:** `542` (ACH_SHOP_ITEM_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `542` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `items` | [`StoreItem[]`](../api/interfaces/StoreItem.md) | Array of purchased items |

---

## Mini-Games

### getMiniGames

Get all available mini-games (spin wheels, scratch cards, etc.).

#### Request

**ClassId:** `700` (SAW_GET_SPINS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `700` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `701` (SAW_GET_SPINS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `701` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `templates` | [`SAWTemplate[]`](../api/interfaces/SAWTemplate.md) | Array of mini-game templates |

---

### playMiniGame

Play a mini-game and get prize.

#### Request

**ClassId:** `702` (SAW_DO_SPIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `702` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `saw_template_id` | `number` | Mini-game template ID |

#### Response

**ClassId:** `703` (SAW_DO_SPIN_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `703` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `saw_prize_id` | `number` | Won prize ID |
| `request_id` | `string` | Request ID for acknowledgement |

---

### playMiniGameBatch

Play a mini-game multiple times in a single request.

#### Request

**ClassId:** `712` (SAW_DO_SPIN_BATCH_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `712` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `spins` | `array` | Array of spin objects with `request_id` (string) and `saw_template_id` (number) |

#### Response

**ClassId:** `713` (SAW_DO_SPIN_BATCH_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `713` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `spins` | `array` | Array of spin results, each containing prize information |

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
  "spins": [
    { "request_id": "spin-1", "prize_type": 1, "prize_value": 100 },
    { "request_id": "spin-2", "prize_type": 2, "prize_value": 50 },
    { "request_id": "spin-3", "prize_type": 1, "prize_value": 200 }
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
| `cid` | `number` | `704` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `request_id` | `string` | Request ID from the spin response |

#### Response

**ClassId:** `705` (SAW_AKNOWLEDGE_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `705` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### getMiniGamesHistory

Get mini-game play history.

#### Request

**ClassId:** `716` (GET_SAW_HISTORY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `716` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `limit` | `number` | Max items to return |
| `offset` | `number` | Offset for pagination |
| `saw_template_id` | `number` | Filter by template ID (optional) |

#### Response

**ClassId:** `717` (GET_SAW_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `717` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `history` | [`SAWPrizesHistory[]`](../api/interfaces/SAWPrizesHistory.md) | Array of history items |

---

## Tournaments

### getTournamentsList

Get all active tournament instances.

#### Request

**ClassId:** `517` (GET_TOURNAMENT_LOBBY_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `517` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |

#### Response

**ClassId:** `518` (GET_TOURNAMENT_LOBBY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `518` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `tournaments` | [`Tournament[]`](../api/interfaces/Tournament.md) | Array of tournaments |

---

### getTournamentInstanceInfo

Get detailed information about a tournament instance including leaderboard.

#### Request

**ClassId:** `519` (GET_TOURNAMENT_INFO_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `519` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `tournament_instance_id` | `number` | Tournament instance ID |

#### Response

**ClassId:** `520` (GET_TOURNAMENT_INFO_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `520` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
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
| `cid` | `number` | `521` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `tournament_instance_id` | `number` | Tournament instance ID |

#### Response

**ClassId:** `522` (TOURNAMENT_REGISTER_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `522` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `errMsg` | `string` | Error message (if any) |

---

## Leaderboard

### getLeaderBoard

Get leaderboard for a specific period type.

#### Request

**ClassId:** `505` (GET_LEADERS_BOARD_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `505` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `period_type` | `number` | Period type: `1` = Daily, `2` = Weekly, `3` = Monthly |
| `get_previous_period` | `boolean` | Get previous period instead of current |

#### Response

**ClassId:** `506` (GET_LEADERS_BOARD_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `506` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
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
| `cid` | `number` | `513` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `from` | `number` | Start index (default 0) |
| `to` | `number` | End index (default 20) |
| `only_favorite` | `boolean` | Filter favorites only |
| `category_id` | `number` | Filter by category |
| `read_status` | `number` | Filter by read status |

#### Response

**ClassId:** `514` (GET_INBOX_MESSAGES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `514` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `messages` | [`InboxMessage[]`](../api/interfaces/InboxMessage.md) | Array of messages |
| `unread_count` | `number` | Total unread count |

---

### markInboxMessageAsRead

Mark an inbox message as read.

#### Request

**ClassId:** `529` (MARK_INBOX_READ_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `529` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `message_guid` | `string` | Message GUID |

#### Response

**ClassId:** `530` (MARK_INBOX_READ_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `530` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### markInboxMessageAsFavorite

Mark/unmark an inbox message as favorite.

#### Request

**ClassId:** `531` (MARK_INBOX_STARRED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `531` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `message_guid` | `string` | Message GUID |
| `mark` | `boolean` | `true` to add, `false` to remove |

#### Response

**ClassId:** `532` (MARK_INBOX_STARRED_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `532` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### deleteInboxMessage

Delete an inbox message.

#### Request

**ClassId:** `535` (MARK_INBOX_DELETED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `535` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `message_guid` | `string` | Message GUID |

#### Response

**ClassId:** `536` (MARK_INBOX_DELETED_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `536` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### getInboxUnreadCount

Get unread inbox message count.

> **Note:** This uses the same ClassId as `getInboxMessages`. The unread count is returned in the `unread_count` field of the response.

#### Request

**ClassId:** `513` (GET_INBOX_MESSAGES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `513` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `limit` | `number` | Set to `1` (minimal fetch) |
| `offset` | `number` | Set to `0` |

#### Response

**ClassId:** `514` (GET_INBOX_MESSAGES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `514` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
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
| `cid` | `number` | `529` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `all_read` | `boolean` | Set to `true` |

#### Response

**ClassId:** `530` (MARK_INBOX_READ_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `530` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### deleteAllInboxMessages

Delete all inbox messages.

#### Request

**ClassId:** `535` (MARK_INBOX_DELETED_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `535` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `all_deleted` | `boolean` | Set to `true` |

#### Response

**ClassId:** `536` (MARK_INBOX_DELETED_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `536` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

## Jackpots

### getJackpots

Get all available jackpots.

#### Request

**ClassId:** `800` (JP_GET_JACKPOTS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `800` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `jp_template_id` | `number` | Filter by template ID (optional) |

#### Response

**ClassId:** `801` (JP_GET_JACKPOTS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `801` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `items` | [`JackpotDetails[]`](../api/interfaces/JackpotDetails.md) | Array of jackpots |

---

### jackpotOptIn

Opt-in to a jackpot.

#### Request

**ClassId:** `804` (JP_OPTIN_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `804` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `805` (JP_OPTIN_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `805` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### jackpotOptOut

Opt-out from a jackpot.

#### Request

**ClassId:** `806` (JP_OPTOUT_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `806` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `807` (JP_OPTOUT_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `807` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |

---

### getJackpotWinners

Get jackpot winners history.

#### Request

**ClassId:** `809` (JP_GET_WINNERS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `809` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `jp_template_id` | `number` | Jackpot template ID |
| `limit` | `number` | Max items to return |
| `offset` | `number` | Offset for pagination |

#### Response

**ClassId:** `810` (JP_GET_WINNERS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `810` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `winners` | [`JackpotWinnerHistory[]`](../api/interfaces/JackpotWinnerHistory.md) | Array of winners |

---

### getJackpotEligibleGames

Get games eligible for a specific jackpot.

#### Request

**ClassId:** `811` (JP_GET_ELIGIBLE_GAMES_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `811` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `jp_template_id` | `number` | Jackpot template ID |

#### Response

**ClassId:** `812` (JP_GET_ELIGIBLE_GAMES_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `812` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `games` | `array` | Array of eligible game IDs |

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
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
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
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
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
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
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
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
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
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
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
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |
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
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
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

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |

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
| `cid` | `number` | ✓ | Message type identifier |
| `uuid` | `string` | ✓ | Unique request identifier |
| `ts` | `number` | ✓ | Timestamp in milliseconds |
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

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | Message type identifier |
| `errCode` | `number` | Error code. `0` = success |
| `errMsg` | `string` | Error message (if any) |

---

## Other

### getTranslations

Get UI translations for a specific language.

#### Request

**ClassId:** `13` (GET_TRANSLATIONS_REQUEST)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `13` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `lang_code` | `string` | Language code (e.g., "en", "de", "fr") |

#### Response

**ClassId:** `14` (GET_TRANSLATIONS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `14` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `translations` | `object` | Key-value map of translation strings |

#### Example

**Request:**
```json
{
  "cid": 13,
  "uuid": "trans-123",
  "ts": 1699999999999,
  "lang_code": "en"
}
```

**Response:**
```json
{
  "cid": 14,
  "uuid": "trans-123",
  "errCode": 0,
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
| `cid` | `number` | `545` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `startTimeSeconds` | `number` | Start time (Unix timestamp in seconds) |
| `endTimeSeconds` | `number` | End time (Unix timestamp in seconds) |

#### Response

**ClassId:** `546` (GET_POINT_HISTORY_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `546` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
| `logHistory` | [`ActivityLogEntry[]`](../api/interfaces/ActivityLogEntry.md) | Array of points history entries (PointsLog or GemsDiamondsLog) |

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
| `cid` | `number` | `543` |
| `uuid` | `string` | Unique request identifier |
| `ts` | `number` | Timestamp (ms) |
| `related_game_id` | `string` | Game ID to find related items for |

#### Response

**ClassId:** `544` (GET_RELATED_ACH_N_TOURNAMENTS_RESPONSE)

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `number` | `544` |
| `uuid` | `string` | Request identifier |
| `errCode` | `number` | Error code (`0` = success) |
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
