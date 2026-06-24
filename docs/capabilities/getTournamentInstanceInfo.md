# getTournamentInstanceInfo — API (TTournamentDetailed)

> Returns the full detail of a single tournament instance — adds the player leaderboard, the full prize structure, and (for clan tournaments) the clan leaderboard and per-clan prize structure on top of everything already in `TTournament`.
> Import: `import { TTournamentDetailed } from '@smartico/public-api'`
> Search terms: getTournamentInstanceInfo, tournaments, getTournament, TTournamentDetailed, TRibbon, TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS, TournamentRegistrationTypeName, TournamentRegistrationStatusName, AchRelatedGame, Fixed, Dynamic, instance_id, tournament_id, name, description, image1, image2, image2_mobile, prize_pool_short

## Signature
```ts
_smartico.api.getTournamentInstanceInfo(tournamentInstanceId: number): Promise<TTournamentDetailed>
```

## Parameters
- `tournamentInstanceId` — The `instance_id` from a `TTournament` returned by `getTournamentsList`.

## Returns — `Promise<TTournamentDetailed>`
`TTournamentDetailed`:
- `instance_id` (number) — ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run
- `tournament_id` (number) — ID of tournament template
- `name` (string) — Name of the tournament, translated to the user language
- `description` (string) — Description of the tournament, translated to the user language
- `image1` (string) — 1st image URL representing the tournament, 544×216px
- `image2` (string) — 2nd image URL representing the tournament, 920x200px
- `image2_mobile` (string) — 2nd image URL representing the tournament for mobile, 720x400px
- `prize_pool_short` (string) — The message indicating the prize pool of the tournament
- `custom_price_text` (string) — The message indicating the price to register in the tournament
- `segment_dont_match_message` (string) — The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS
- `custom_section_id` (number) — The ID of the custom section where the tournament is assigned The list of custom sections can be retrieved using _smartico.api.getCustomSections() method
- `custom_data` (any) — The custom data of the tournament defined by operator. Can be a JSON object, string or number
- `is_featured` (boolean) — The indicator if the tournament is 'Featured'
- `ribbon` (TRibbon) — The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon, 250×300px
- `priority` (number) — A number is used to order the tournaments, representing their priority in the list
- `me` ({
		/** The username of the current user */
		public_username: string;
		/** The URL to the avatar of the current user */
		avatar_url: string;
		/** The position of the current user in the tournament */
		position: number;
		/** The scores of the current user in the tournament */
		scores: number;
		/** The external user id of the current user */
		user_ext_id: string;
		/** The crm brand id of the current user */
		crm_brand_id: number;
		/** The user id of the current user */
		user_id: number;
	}) — The information about current user in the tournament if he is registered in the tournamnet
- `prizes` ({
		/** The name of the prize */
		name: string;
		/** The description of the prize */
		description: string;
		/** The image of the prize, 1:1 aspect ratio */
		image_url: string;
		/** from-to range of the places to which this prize */
		place_from: number;
		place_to: number;
		/** type of the prize: TANGIBLE, POINTS_ADD, POINTS_DEDUCT, POINTS_RESET, MINI_GAME_ATTEMPT, BONUS */
		type: string;
		/** if the prize is points related, indicates amount of points */
		points?: number;
	}[])
- `start_time` (number) — The time when tournament is going to start, epoch with milliseconds
- `end_time` (number) — The time when tournament is going to finish, epoch with milliseconds
- `registration_type` (TournamentRegistrationTypeName) — Type of registration in the tournament
- `registration_count` (number) — Number of users registered in the tournament
- `is_user_registered` (boolean) — flag indicating if current user is registered in the tournament
- `players_min_count` (number) — Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start
- `players_max_count` (number) — Maximum number of participant for this tournament. When reached, new users won't be able to register
- `registration_status` (TournamentRegistrationStatusName) — Status of registration in the tournament for current user
- `duration_ms` (number) — Tournament duration in millisecnnds
- `registration_cost_points` (number) — Cost of registration in the tournament in gamification points
- `registration_cost_gems` (number) — Cost of registration in the tournament in gems
- `registration_cost_diamonds` (number) — Cost of registration in the tournament in diamonds
- `is_active` (boolean) — Indicator if tournament instance is active, means in one of the statues - PUBLISHED, REGISTED, STARTED
- `is_can_register` (boolean) — Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet
- `is_cancelled` (boolean) — Indicator if tournament instance is cancelled (status CANCELLED)
- `is_finished` (boolean) — Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING)
- `is_in_progress` (boolean) — Indicator if tournament instance is running (status STARTED)
- `is_upcoming` (boolean) — Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER)
- `min_scores_win` (number) — The minimum amount of score points that the user should get in order to be qualified for the prize
- `hide_leaderboard_min_scores` (boolean) — When enabled, users who don’t meet the minimum qualifying score will be hidden from the Leaderboard
- `total_scores` (number) — Total scores across all participants in the tournament
- `is_clan_based` (boolean) — True when this tournament groups participants by clan
- `related_games` (AchRelatedGame[]) — List of casino games (or other types of entities) related to the tournament
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
- `players` ({
		/** The username of the participant */
		public_username: string;
		/** The URL to the avatar of the participant */
		avatar_url: string;
		/** The position of the participant in the tournament */
		position: number;
		/** The scores of the participant in the tournament */
		scores: number;
		/** The indicator if the participant is current user */
		is_me: boolean;
		/** The external user id of the participant */
		user_ext_id: string;
		/** The crm brand id of the participant */
		crm_brand_id: number;
		/** The user id of the participant */
		user_id: number;
	}[]) — The list of the tournament participants
- `clan_leaderboard` ({
		clan_id: number;
		public_meta: { name: string; description: string; image_url: string };
		position: number;
		total_score: number;
		contributing_members: number;
	}[] | null) — Ranked list of clans in this tournament; null for non-clan tournaments
- `user_clan_id` (number | null) — The clan ID the current user belongs to; null when clanless or non-clan tournament
- `user_position_in_clan` (number | null) — The user's rank within their own clan; null when clanless or not registered
- `user_score_in_clan` (number | null) — The user's score contribution to their clan; null when clanless or not registered
- `clan_prize_structure` ({
		clan_place: number;
		/** 1 = Fixed, 2 = Dynamic */
		prize_type_id: number;
		prize_pool_amount: number | null;
		prize_pool_currency_code: string | null;
		activity_type_id: number | null;
		details_json: Record<string, any>;
		public_meta: { name: string; description: string; image_url: string; prize_name?: string } | null;
		tiers: {
			player_place_from: number;
			player_place_to: number;
			pool_amount: number | null;
			/** 1 = ScoreWeighted, 2 = EqualSplit; null for Fixed */
			distribution_type: number | null;
			activity_type_id: number;
			details_json: Record<string, any>;
			public_meta: { name: string; description: string; image_url: string } | null;
		}[];
	}[] | null) — Per-clan prize structure; null for non-clan tournaments

## Behavioral contract
**Preconditions**
Pass a valid `tournamentInstanceId` read from `TTournament.instance_id`
on an item returned by `getTournamentsList`. The method works
standalone — calling `getTournamentsList()` first is not required by
the SDK, but is the only stable source of valid IDs.

**Refresh model**
- **No subscription.** This is a one-shot promise; call again to
 refresh.
- **No client cache.** Every call sends a network request and
 returns the latest server snapshot. Safe to poll on an interval —
 the default Smartico UI uses 3 s while the detail view is visible.
- **No push event** invalidates or refreshes detail state. Score
 changes, registration count changes, lifecycle transitions — all
 require a fresh `getTournamentInstanceInfo` call.

**Returned shape — beyond `TTournament`**
`TTournamentDetailed` extends `TTournament` with the following
additional data: a `players[]` leaderboard sorted server-side by
score (only members with at least one recorded score); the user's
own `me` block carrying their rank and score (undefined when not
registered or when the user has no score yet); a full per-place
`prizes[]` array (place range, type, points / gems / diamonds
amounts, image, name); and `related_games[]` if the operator has
associated games with this tournament. For clan tournaments
(`is_clan_based === true`), the response also carries
`clan_leaderboard[]` (ranked clans with `total_score` and
`contributing_members`), `clan_prize_structure[]` (per-clan-place
prize tiers — Fixed vs Dynamic, with ScoreWeighted /
EqualSplit distribution for Dynamic prizes), `user_clan_id` (the
user's own clan), and the advisory `user_position_in_clan` /
`user_score_in_clan` fields.

**Idempotency**: safe. Read-only. Each call returns the latest
server snapshot.

**Side effects**: none — pure metadata read.

**UI guidance**: see [UI Guide — `getTournamentInstanceInfo`](../../docs/ui/tournaments/UIGuide_getTournamentInstanceInfo.md).

**Visitor mode**: not supported. Use `getTournamentsList` for
the public lobby list in visitor mode; the detail endpoint requires
an authenticated session.

## Example
```ts
const tournaments = await window._smartico.api.getTournamentsList();
const tournament = tournaments[0];

console.log('[smartico] loading detail view for tournament', tournament.instance_id);
const detail = await window._smartico.api.getTournamentInstanceInfo(tournament.instance_id);

console.log('[smartico] render detail with', detail.players?.length ?? 0,
  'players,', detail.prizes?.length ?? 0, 'prize tiers');

if (detail.is_clan_based && detail.clan_leaderboard) {
  console.log('[smartico] clan tournament — render clan leaderboard tab with',
    detail.clan_leaderboard.length, 'clans');
  if (detail.user_clan_id != null) {
    console.log('[smartico] user belongs to clan', detail.user_clan_id,
      '— highlight that row in the clan leaderboard');
  }
}

// Live leaderboard updates — poll every 3 seconds while the detail view is open.
const pollId = setInterval(async () => {
  try {
    const fresh = await window._smartico.api.getTournamentInstanceInfo(tournament.instance_id);
    console.log('[smartico] detail refreshed — re-render player + clan leaderboards from this new snapshot:', fresh);
  } catch (e) {
    console.error('[smartico] tournament detail poll failed — keep showing last snapshot, retry on next tick:', e);
  }
}, 3_000);
// clearInterval(pollId) when the detail view closes.

if (detail.me) {
  console.log('[smartico] current user is rank', detail.me.position,
    'with', detail.me.scores, 'points — render the sticky "me" panel below the leaderboard');
}
```

### Example response (REAL shape)
```json
{
  "instance_id": 585461,
  "tournament_id": 4450,
  "name": "Old Dragon's Hoard",
  "description": "   <style>\n        /* Add your CSS here */\n        .custom-rules {\n            font-family: inherit;\n            background-color: #2c295c !important;\n      …",
  "image1": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773753066010-1.png",
  "image2": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773755039087-0.png",
  "image2_mobile": "https://cdn.example/00000000-0000-0000-0000-000000000000/entity-image-1773755761006-0.png",
  "prize_pool_short": "The Dragon's treasure",
  "custom_data": {},
  "is_featured": false,
  "start_time": 1782216000000,
  "end_time": 1782302400000,
  "registration_count": 0,
  "is_user_registered": false,
  "players_min_count": 0,
  "players_max_count": 200,
  "registration_status": "UNKNOWN",
  "registration_type": "BUY_IN_GEMS",
  "registration_cost_gems": 3,
  "duration_ms": 86400000,
  "is_active": true,
  "is_can_register": false,
  "is_cancelled": false,
  "is_finished": false,
  "is_in_progress": true,
  "is_upcoming": false,
  "min_scores_win": 1,
  "hide_leaderboard_min_scores": false,
  "total_scores": null,
  "is_clan_based": false,
  "related_games": [
    {
      "ext_game_id": "dragon-fortune",
      "game_public_meta": {
        "name": "Dragon Fortune",
        "link": "/game/dragon-fortune",
        "image": "https://cdn.example/e93b87dfd94d462de49bc3-china.png",
        "enabled": true,
        "priority": 1
      }
    }
  ],
  "players": [],
  "prizes": [
    {
      "gems": 10,
      "image_url": "https://cdn.example/ecec44e4c2d0555b4d8a32-Gems10.webp",
      "name": "10 gems",
      "id": 38778,
      "type": "GEMS_AND_DIAMONDS_ADD",
      "place_from": 1,
      "place_to": 1
    }
  ]
}
```

## Errors
See this method's TSDoc / the mutation pages for `err_code` handling.

## Related
- `getTournamentsList`
