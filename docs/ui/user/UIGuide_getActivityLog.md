# UI Guide — `getActivityLog`

## Overview
- Returns the user's activity history in the requested window, newest-first.
  By default only wallet rows (points / gems / diamonds). Pass
  `new_format: true` for the full activity feed (missions, badges, levels,
  tournaments, …) — the extra data comes in optional fields on `TActivityLog`.
  The full feed must be enabled on the Smartico side; where it is not,
  `new_format: true` still returns wallet rows only.
- Power an "Activity" / "History" tab showing wins, claims, purchases,
  level-up rewards, and operator adjustments.
- 30 s SDK cache + push refresh on every wallet change (with a caveat —
  see below).

## List view organization

Single flat list, server-sorted newest-first by `create_date`. The default
Smartico UI groups rows visually by calendar day (e.g. "Today", "Yesterday",
"24 May").

### Time-period filter chips

The default Smartico UI exposes these filters on top:

| Chip | `startTimeSeconds` | `endTimeSeconds` |
|---|---|---|
| Today | today 00:00 local | now + 60 s |
| This week | Monday 00:00 local | now + 60 s |
| Previous week | Prev Monday 00:00 | Prev Sunday 23:59:59 |
| Last 24 h (default) | now − 86400 | now + 60 s |

Custom UIs can pick any window; the server scans the full range.

## Item card / row

Fields rendered per row:

| Field | Source | Notes |
|---|---|---|
| Currency icon | `type` (`UserBalanceType`) | points / gems / diamonds icon |
| Amount | `amount` | Prepend `+` if positive; color green when `>= 0`, red when negative |
| Balance after | `balance` | Right-aligned column |
| Source label | `source_type_id` (`PointChangeSourceType`) | See mapping table below |
| Timestamp | `create_date` (epoch s × 1000) | Relative ("2h ago") or HH:MM |

## Source label mapping

For consistency with the default Smartico UI, group source IDs into these
display buckets:

| `PointChangeSourceType` | Display label |
|---|---|
| `Journey` (1), `ManualAdjustment` (6), `AutomationRule` (12), `API` (18) | "Marketing" |
| `AchievementTaskCompletion` (2) | "Mission Task" |
| `AchievementCompletion` (3) | "Mission" |
| `LevelsStructureChange` (4) | "Level" |
| `StorePurchase` (5) | "Store" |
| `Leaderboard` (7) | "Leaderboard" |
| `Tournament` (11), `TournamentRegistration` (13), `TournamentRegistrationCancellation` (14) | "Tournament" |
| `RefundPoints` (15) | "Refund" |
| `PlayMiniGame` (16), `WinMiniGame` (17) | "Mini-Game" |
| `DynamicFormula` (19) | "Formula" |
| `Raffle` (21) | "Raffle" |
| `Avatars` (22) | "Avatar" |
| *(any unknown)* | "Other" |

## Pagination

`from` and `to` are offset + ceiling, NOT timestamps:

- `offset = from`
- `limit = min(to - from, 50)` — server hard-caps at 50 rows per request.

For infinite scroll, advance `from` by 50 each page. Detect end of list when
the returned array length is less than the requested page size.

## Subscription model — `onUpdate` caveat

The `onUpdate` callback fires whenever the user's points / gems / diamonds
balance changes. The SDK then re-fetches **the same window you subscribed
with** — the same `startTimeSeconds`, `endTimeSeconds`, `from`, `to`,
`types`, `src_types` and `new_format` — and passes that result to the
callback.

Two things follow from that:

- **The window end is fixed.** Rows created after your `endTimeSeconds` are
  not in the pushed payload. If your window ends at "now", treat `onUpdate`
  as a "new activity arrived" signal and call `getActivityLog` again with a
  fresh `endTimeSeconds` (the default Smartico UI uses `now + 60 s` for its
  open-ended chips, which covers only the next minute).
- **One subscription at a time.** Only the most recent call that passed an
  `onUpdate` is refreshed. Calling again with a different window (e.g. the
  user switched the period chip) moves the subscription to that window.

```ts
const subscribe = () => window._smartico.api.getActivityLog({
  startTimeSeconds: thirtyDaysAgo,
  endTimeSeconds: Math.floor(Date.now() / 1000) + 60,
  from: 0, to: 50,
  onUpdate: () => {
    console.log('[smartico] wallet changed — re-fetch with a fresh window end and re-render the list');
    subscribe().then((rows) => console.log('[smartico] render', rows.length, 'rows'));
  },
});
const log = await subscribe();
```

## Empty / loading / error states

- **Empty**: "No activity in this period" — common for new users or
  narrow time windows.
- **Loading (cold fetch)**: skeleton list (5 placeholder rows).
- **Error**: keep prior list if any; non-blocking banner.

## Refresh

- 30 s SDK cache absorbs rapid tab switches.
- Push triggers fire on every wallet change; the SDK handles invalidation
  internally.
- For the user's CURRENT balance (not the activity log), read
  [`getUserProfile`](../../api/classes/WSAPIUser.md#getuserprofile) — the
  activity log is for historical detail, not for the current balance widget.

## Mobile vs desktop

- **Desktop**: row shows activity icon · source label · amount · balance · time.
- **Mobile**: row stacks activity + source label on the left, amount + balance
  on the right.

## Performance

- 30 s cache + push invalidation makes repeated tab opens cheap.
- 50-row page limit — paginate via `from` for full history.
- Don't poll — the `onUpdate` callback handles change detection.
