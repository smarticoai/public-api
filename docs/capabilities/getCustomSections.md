# getCustomSections — API (TUICustomSection)

> Returns the operator-configured "custom sections" the current user is eligible to see.
> Import: `import { TUICustomSection } from '@smartico/public-api'`
> Search terms: getCustomSections, general, TUICustomSection, AchCustomSectionType, AchCustomLayoutTheme, AchMissionsTabsOptions, AchOverviewMissionsFilter, LiquidEntityData, id, body, menu_img, menu_name, section_type_id, liquid_entity_data, liquid_template

## Signature
```ts
_smartico.api.getCustomSections(): Promise<TUICustomSection[]>
```

## Parameters
_None._

## Returns — `Promise<TUICustomSection[]>`
Array of `TUICustomSection`. Each item:
- `id` (number) — Stable numeric ID of the section.
- `body` (string) — Raw HTML body for `HTML_PAGE` sections; Liquid template body for `LEVELS` (Liquid) sections.
- `menu_img` (string) — CDN URL of the section's nav icon, 64x64 px square.
- `menu_name` (string) — Display name shown next to the nav icon. Pre-translated server-side.
- `custom_skin_images` (string) — JSON-serialized list of skin image overrides for themed sections (e.g. `MISSION_CUSTOM_LAYOUT`).
- `section_type_id` (AchCustomSectionType) — Dispatch key — see `AchCustomSectionType`.
- `theme` (AchCustomLayoutTheme) — Themed-layout name for `MISSION_CUSTOM_LAYOUT` sections; see `AchCustomLayoutTheme`.
- `generic_custom_css` (string) — Custom CSS for themed layouts.
- `mission_tabs_options` (AchMissionsTabsOptions) — Which tabs to render for `MISSIONS_CATEGORY` sections; see `AchMissionsTabsOptions`.
- `overview_missions_filter` (AchOverviewMissionsFilter) — Mission-filter rule for the Overview tab; see `AchOverviewMissionsFilter`.
- `overview_missions_count` (number) — Maximum number of missions shown in the Overview tab.
- `url_or_dp` (string) — Click target for `REDIRECT_LINK` sections — either a Smartico DP string (`dp:…`) or an external URL.
- `liquid_entity_data` (LiquidEntityData[]) — Data-context selectors for Liquid templates; see `LiquidEntityData`.
- `ach_tournament_id` (number) — Tournament ID for a single-tournament Liquid template (`LiquidEntityData.Tournament`).
- `show_raw_data` (boolean) — Operator debug flag — when `true`, Liquid renders raw context data instead of the templated HTML.
- `liquid_template` (number) — Liquid template ID resolved server-side; the rendered body is delivered in `body`.
- `ach_category_ids` (number[]) — Category IDs the section filters badges by — correlate with `getAchCategories()`.
- `shop_category_ids` (number[]) — Category IDs the section filters store items by — correlate with `getStoreCategories()`.
- `raffle_id` (number) — Raffle ID for `RAFFLE` sections (and `LiquidEntityData.SingleRaffle` Liquid templates).

## Behavioral contract
**Preconditions**
- No prerequisite calls. Typically fetched once at app boot to build the
  navigation skeleton.

**Server-side eligibility filtering**
Sections are filtered server-side by the user's segments / level / brand and
the section's `active_from_date` / `active_till_date` window. Sections the
user is ineligible for are omitted from the response entirely — there is no
"locked" state to render.

**Ordering**
Response is server-ordered. Render in the order received; do NOT re-sort
client-side (the operator's order is the intended nav order).

**Refresh**
- The SDK caches results for 30 seconds.
- No push subscription. Re-call after a segment / level change might
  make new sections eligible, or just rely on the 30 s cache turnover.

**Visitor mode**: supported.

**UI guidance**: see [UI Guide — `getCustomSections`](../../docs/ui/general/UIGuide_getCustomSections.md).

## Example
```ts
const sections = await window._smartico.api.getCustomSections();

for (const s of sections) {
    console.log('[smartico] nav entry', s.menu_name, 'type', s.section_type_id, '→ mount the matching page component');
    // Render s.menu_img (64x64) as the nav icon and s.menu_name as the label.
    // For section_type_id === AchCustomSectionType.REDIRECT_LINK, do NOT mount a page —
    // resolve s.url_or_dp on click (DP string or external URL).
}
```

### Example response (REAL shape)
```json
[
  {
    "id": 625,
    "body": "<!-- Google Font -->\n<link href=\"https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap\" rel=\"stylesheet\">\n\n<style…",
    "menu_img": "https://cdn.example/9f1d1ae8915eef1f5db75c-Storeitemcopy21ice.png",
    "menu_name": "Custom overview",
    "section_type_id": 4,
    "liquid_entity_data": [
      1
    ],
    "liquid_template": 1
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `AchCustomSectionType`
- `TUICustomSection`
