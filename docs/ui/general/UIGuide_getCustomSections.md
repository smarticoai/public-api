# UI Guide — `getCustomSections`

## Overview
- Returns the user-eligible custom sections that the operator configured in the
  BO. Each section is a nav-level entry the consumer renders in a side menu /
  bottom-bar / desktop sidebar.
- `section_type_id` (see `AchCustomSectionType`) is the dispatch key — it tells
  the consumer which page component to mount when the user opens the section.
- 30 s cache; no push subscription.

## Nav layout

Render sections in the order returned — do NOT re-sort client-side. The operator
chose the order; preserve it.

| Surface | Default Smartico UI behavior |
|---|---|
| Mobile hamburger menu | `menu_img` (left) + `menu_name` (label) |
| Desktop sidebar / new navbar | `menu_img` + `menu_name` row |
| Home bottom tab bar | `menu_img` as the icon for each tab |

## Section type → page mapping

`section_type_id` drives the component to mount:

| `AchCustomSectionType` | Page behavior |
|---|---|
| `HTML_PAGE` (1) | Render `body` as raw HTML in a sandboxed container |
| `MISSIONS_CATEGORY` (2) | Mount the missions page; filter to missions in this section |
| `TOURNAMENTS_CATEGORY` (3) | Mount the tournaments page; filter to tournaments in this section |
| `LEVELS` (4) | Liquid-template page; render `body` inside an iframe with the data context selected via `liquid_entity_data` |
| `MINI_GAMES` (5) | Mount the SAW page; filter mini-games to this section |
| `MISSION_CUSTOM_LAYOUT` (6) | Themed card-grid mission view; apply `theme` + optional `custom_skin_images` + `generic_custom_css` |
| `MATCH_X_AND_QUIZ` (7) | Mount the SAW page; filter to MatchX / Quiz games only |
| `REDIRECT_LINK` (9) | Do NOT mount a page; on click resolve `url_or_dp` (Smartico DP string or external URL) |
| `LOOTBOX_WEEKLY` (10) | Mount the SAW page; filter to weekly lootbox templates |
| `LOOTBOX_CALENDAR_DAYS` (11) | Mount the SAW page; filter to calendar-day lootbox templates |
| `STORE` (12) | Mount the store page; filter items by `shop_category_ids` |
| `RAFFLE` (13) | Mount the raffle page; show the raffle referenced by `raffle_id` |
| `BADGES` (14) | Mount the badges page; filter to `ach_category_ids` |

If a `section_type_id` value is not in this map, skip the section silently —
the operator might have configured a type the consumer doesn't yet support.

## Item card / nav row

Fields rendered per section in the nav:

| Field | Source | Notes |
|---|---|---|
| Icon | `menu_img` | 64 × 64 px (1:1). Fallback chain: `.webp → .png` |
| Label | `menu_name` | Server-pre-translated |
| Notification badge | derived (see below) | Per-section unread count |

**Notification badges** — the default Smartico UI shows an unread count for
sections of these types:

- `MISSIONS_CATEGORY`: count of new missions
- `BADGES`: count of new badges
- `TOURNAMENTS_CATEGORY`: count of new tournaments
- `MINI_GAMES`: count of spinnable templates
- `LOOTBOX_WEEKLY` / `LOOTBOX_CALENDAR_DAYS`: count of spinnable lootboxes
- `MATCH_X_AND_QUIZ`: count of unfinished MatchX / Quiz games

Other types (`HTML_PAGE`, `LEVELS`, `STORE`, `RAFFLE`, `REDIRECT_LINK`) don't
typically need a badge — the default UI omits them.

## Theming (`MISSION_CUSTOM_LAYOUT` only)

The `theme` field applies only to `MISSION_CUSTOM_LAYOUT` sections — it does
not override the global widget theme for other types. The default Smartico UI
maps `GENERIC` to a configurable layout (using `custom_skin_images` +
`generic_custom_css`) and other values (`valentines-light`, `valentines-dark`,
`euro-2024`) to fixed seasonal layouts.

## Liquid templates (`LEVELS` type)

For `section_type_id === LEVELS`, render `body` (the operator-authored Liquid
template) inside a sandboxed iframe. Inject the data context selected by
`liquid_entity_data` — each ID names one entity collection the consumer
should pass into the template:

| `LiquidEntityData` ID | Context name |
|---|---|
| `Missions` (1) | `missions` |
| `Store` (2) | `items` + `storeItems` |
| `Tournaments` (3) | `tournaments` |
| `MiniGames` (4) | `miniGames` |
| `Levels` (5) | `levels` |
| `Jackpots` (6) | `jackpots` |
| `Bonus` (7) | `bonuses` |
| `Badges` (9) | `badges` + `badgeCategories` |
| `Tournament` (10) | `singleTournament` (from `ach_tournament_id`) |
| `Raffles` (11) | `raffles` |
| `SingleRaffle` (12) | `singleRaffle` (from `raffle_id`) |

Also always inject `userInfo`, `liquidParams` (URL params), `storeCategories`,
`badgeCategories` for any Liquid section.

Provide a `_smartico` proxy so inner template JS can call public SDK methods
(`openMission()`, `openTournament()`, etc.) back to the parent frame via
postMessage.

## Image / asset specs

- **Nav icon (`menu_img`)**: 64 × 64 px (1:1).
- **Format**: WebP when supported; PNG fallback.
- **Fallback chain**: `.webp → .png → default placeholder`.

## Empty / loading / error states

- **Empty (no sections)**: render the built-in pages only (Missions /
  Tournaments / Store / etc.) — no custom-section additions.
- **Loading (cold fetch)**: skeleton nav placeholders (3–5 rows).
- **Error**: keep prior nav state if any; non-blocking banner.

## Refresh

- 30 s SDK cache absorbs nav re-mounts.
- No push subscription. Sections become eligible (or ineligible) when the
  user's segments / level change server-side; the next call after the cache
  window expires picks the new set up.

## Mobile vs desktop

- **Mobile**: hamburger menu OR bottom tab bar (depending on the consumer's
  shell).
- **Desktop**: persistent sidebar with icon + label.
- **Tab bar overflow**: when sections exceed the tab bar capacity (default 5),
  the default Smartico UI moves overflow into a "More" menu.

## Performance

- Cache for 30 s; fetch once at app boot.
- Pre-load `menu_img` icons at first nav render.
- For Liquid sections (`LEVELS`), lazy-load the iframe — don't mount it until
  the user navigates to the section.
