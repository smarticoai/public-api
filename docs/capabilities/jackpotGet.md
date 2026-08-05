# jackpotGet — API (JackpotDetails)

> Returns the user-eligible jackpots active for the label, fused with their live pot values.
> Import: `import { JackpotDetails } from '@smartico/public-api'`
> Search terms: jackpotGet, jackpots, JackpotDetails, JackpotType, JackpotPublicMeta, JackpotHtmlTemplate, JackpotContributionType, JackpotContributionRule, AchRelatedGame, JackpotPot, JackPotTemparature, jp_template_id, jp_type_id, jp_public_meta, jp_currency, user_currency, related_games, contribution_type, contribution_value

## Signature
```ts
_smartico.api.jackpotGet(filter?: { related_game_id?: string; jp_template_id?: number }): Promise<JackpotDetails[]>
```

## Parameters
- `filter` — Optional filter narrowing the result set.
- `filter.related_game_id` — Limit to jackpots linked to this game ID (from the operator's games catalog).
- `filter.jp_template_id` — Limit to a single template.

## Returns — `Promise<JackpotDetails[]>`
Array of `JackpotDetails`. Each item:
- `jp_template_id` (number) — Stable numeric ID of the template; pass to opt-in / opt-out / winners / eligible-games methods.
- `jp_type_id` (JackpotType) — Whether the jackpot has a shared pot or one independent per user; see `JackpotType`.
- `jp_public_meta` (JackpotPublicMeta) — Display data: name, description, image_url, winner / not-winner HTML templates, custom_data (JSON-parsed).
  - `name` (string) — name of the jackpot
  - `description` (string) — description/rules of the jackpot
  - `image_url` (string) — image url of the jackpot
  - `winner_template` (JackpotHtmlTemplate) — HTML template for the winner of the jackpt
    - `id` (string)
    - `content` (string)
  - `not_winner_template` (JackpotHtmlTemplate) — HTML template for the not winner of the jackpot
    - `id` (string)
    - `content` (string)
  - `placeholder1` (string) — custom value of placeholder1 defined by operator and can be used in the HTML templates
  - `placeholder2` (string) — custom value of placeholder2 defined by operator and can be used in the HTML templates
  - `priority` (string) — operator-defined display order, ascending; sent as a string
  - `custom_data` (any) — Custom data that can be used in API to build custom UI. `jackpotGet()` returns this already parsed — an object when the operator stored JSON, otherwise the raw string. Elsewhere (e.g. the jackpot-win push) it arrives unparsed. You can request from Smartico to define fields for your specific case that will be managed from Smartico BackOffice Read more here - <https://help.smartico.ai/welcome/products/tools-and-guides/custom-fields-attributes>
- `jp_currency` (string) — Native jackpot currency (ISO 4217). Used for winner-history amounts.
- `user_currency` (string) — Current user's wallet currency. Used to display the pot via `pot.current_pot_amount_user_currency`.
- `contribution_type` (JackpotContributionType) — Whether the contribution is a fixed amount or a percentage of the bet; see `JackpotContributionType`.
- `contribution_value` (number) — Amount of contribution per qualifying bet — fixed value or percentage depending on `contribution_type`.
- `contribution_rules` (JackpotContributionRule[]) — Per-game / per-provider overrides of `contribution_type` + `contribution_value`; see `JackpotContributionRule`. Empty when the template contributes at a flat rate.
  - `ruleId` (number) — Stable ID of the rule within its template
  - `jpTemplateId` (number) — Template this rule belongs to
  - `type` (JackpotContributionType) — Whether `contributionValue` is a fixed amount or a percentage; see `JackpotContributionType`
  - `extEntityIds` (string[]) — Operator-side game or provider IDs this rule applies to
  - `contributionValue` (number) — Contribution to apply for matching bets — fixed amount or percentage depending on `type`
- `related_games` (AchRelatedGame[]) — Reserved — the server currently always sends an empty array. Use `getJackpotEligibleGames()` for the eligible-games list.
  - `ext_game_id` (string) — The ID of the related game
  - `game_public_meta` ({
		/** The name of the game */
		name: string;
		/** The URL to the game */
		link: string;
		/** The URL to the image of the game, 1:1 aspect ratio */
		image: string;
		/** The indicator if the game is enabled */
		enabled: boolean;
		/** The list of categories of the game */
		game_categories: string[];
		/** The name of the game provider */
		game_provider: string;
		/** The URL to the mobile game */
		mobile_spec_link: string;
		/** The priority of the game */
		priority?: number;
	}) — Game public meta information
- `pot` (JackpotPot) — Live pot snapshot (amount, temperature, last explosion timestamp).
  - `jp_template_id` (number) — Template ID this pot belongs to.
  - `jp_pot_id` (number) — Stable numeric ID of the current pot instance (rotates when the pot explodes).
  - `current_pot_amount` (number) — Current pot amount in the jackpot's native currency (`jp_currency`).
  - `current_pot_amount_user_currency` (number) — Current pot amount converted to the user's wallet currency (`user_currency`).
  - `explode_date_ts` (number | null) — Unix ms timestamp of when this pot last exploded; `null` while the pot is still running.
  - `user_id` (number | null) — Owning user for `JackpotType.Personal` pots; `null` for shared `MultiUser` pots.
  - `current_pot_temperature` (JackPotTemparature) — Heat band of the pot relative to its explosion range; see `JackPotTemparature`.
- `is_opted_in` (boolean) — `true` when the current user is currently opted in.
- `is_auto_opt_in` (boolean) — `true` when eligible users are opted in automatically, so no opt-in CTA is needed; `false` means `jackpotOptIn()` must be called explicitly.
- `ach_related_game_allow_all` (boolean) — `true` when every game in the operator catalog contributes; if `true`, skip `getJackpotEligibleGames`.
- `registration_count` (number) — Number of users currently opted in; always `1` for `JackpotType.Personal`.
- `expose_winners_over_api` (boolean) — Operator flag: whether the winners list should be displayed. Enforced client-side only — gate `getJackpotWinners` calls on this.

## Behavioral contract
**Preconditions**
- No prerequisite calls.
- Visitor mode supported via `_smartico.vapi(lang).jackpotGet(...)`.

**Server-side eligibility filtering**
Jackpots are filtered server-side by the user's segments before being
returned. Templates the user is ineligible for never appear in this
response — there is no "locked" state to render. An empty result for a
known-good user typically means none of the configured templates match
the user's segments / level / brand.

**Filter behavior**
Passing `related_game_id` returns only jackpots linked to that game (from
the operator's games catalog). Passing `jp_template_id` returns just that
single template. With no filter, all active templates the user is
eligible for are returned. Changing the filter between calls flushes both
the template cache and the pot cache.

**Two-tier cache**
- Template definitions: 30 s cache. Re-fetched on filter change or when
 opt-in / opt-out / a jackpot-win push lands.
- Pot values: 1 s cache. Re-fetched on every call past the 1-second
 window so a 1 Hz poll renders a smoothly counting pot.

**`jp_public_meta.custom_data`**
Server returns this as a JSON-encoded string; the SDK parses it inline so
consumers always receive either a parsed object or the raw string.

**Personal vs MultiUser jackpots** (see `JackpotType`)
- `MultiUser` (1) — shared pot; `registration_count` reflects real opted-in
 user count; temperature transitions fire push events.
- `Personal` (2) — independent per-user pot; `registration_count` is
 always 1; temperature push events are suppressed.

**Refresh**
- `jp_status_id`, segment changes, and operator template edits surface
 after the 30 s template cache TTL.
- Opt-in / opt-out / jackpot-win push events all clear the template and
 pot caches — the next call re-fetches.

**Visitor mode**: supported.

**UI guidance**: see [UI Guide — `jackpotGet`](../../docs/ui/jackpots/UIGuide_jackpotGet.md).

## Example
```ts
// Poll every second for live pot counter
setInterval(async () => {
    const jackpots = await window._smartico.api.jackpotGet();
    for (const jp of jackpots) {
        console.log('[smartico] update pot widget for', jp.jp_public_meta.name, '— amount:', jp.pot.current_pot_amount_user_currency, jp.user_currency, '— temperature:', jp.pot.current_pot_temperature);
    }
}, 1000);

// Filtered fetch for a specific game tile
const linked = await window._smartico.api.jackpotGet({ related_game_id: 'gold-slot2' });
console.log('[smartico] linked jackpots for game:', linked.length);
```

### Example response (REAL shape)
> Where this real payload differs from the typed Returns above (TS interface vs raw wire), the REAL shape is the runtime truth.
```json
[
  {
    "jp_template_id": 8,
    "jp_type_id": 2,
    "jp_public_meta": {
      "image_url": "https://cdn.example/f8b68a18473c437e32a860-Jackpot1.jpg",
      "placeholder1": "111111111111111111",
      "placeholder2": "XXXXXXXXXXXXXXXXX",
      "name": "Personal Jackpot For All Games",
      "description": "For every bet, 2% is added to the jackpot pot—split 50/50 between the player’s contribution and the house. Plus, 20% of each jackpot goes toward seeding the …",
      "not_winner_template": {
        "content": "\n<style>\n    @keyframes reveal {\n        0% {\n            transform: translateX(100%);\n        }\n        100% {\n            transform: translateX(0%);\n      …",
        "id": "1"
      },
      "winner_template": {
        "content": "\n<script>\n    document.addEventListener('DOMContentLoaded', () => {\n        const counter = document.getElementById('counter'); \n        const duration = 200…",
        "id": "1"
      },
      "custom_data": {}
    },
    "jp_currency": "EUR",
    "user_currency": "EUR",
    "related_games": [],
    "contribution_type": 2,
    "contribution_value": 2,
    "pot": {
      "jp_template_id": 8,
      "jp_pot_id": null,
      "user_id": null,
      "current_pot_amount": 0,
      "current_pot_amount_user_currency": 0,
      "explode_date_ts": null,
      "current_pot_temperature": 0
    },
    "is_opted_in": true,
    "is_auto_opt_in": false,
    "ach_related_game_allow_all": true,
    "registration_count": 1,
    "contribution_rules": [
      {
        "ruleId": 4,
        "jpTemplateId": 8,
        "type": 2,
        "extEntityIds": [
          "123"
        ],
        "contributionValue": 12
      }
    ],
    "expose_winners_over_api": true
  }
]
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `JackpotType`
- `JackpotDetails`
