import { SAWAskForUsername } from './SAWAskForUsername';
import { SAWExposeUserSpinId } from './SAWExposeUserSpinId';
import { SAWGameDifficultyType } from './SAWGameDifficulty';
import { SAWGameLayout } from './SAWGameLayout';
import { SAWWheelLayout } from './SAWWheelLayout';

/**
 * UI configuration for a SAW (Spin-And-Win) mini-game template.
 *
 * This interface is returned as the `saw_template_ui_definition` property of
 * {@link SAWTemplate} and {@link TMiniGameTemplate}.  It covers all visual,
 * behavioural and game-type-specific settings that the operator can configure
 * in the Back-Office for every mini-game variant (Spin the Wheel, Scratch Card,
 * Gift Box, MatchX / Quiz, Treasure Hunt, Lootbox, Voyager, Prize Drop, etc.).
 */
export interface SAWTemplateUI {

    // ─── Identity & presentation ──────────────────────────────────────────────

    /**
     * CSS skin key that selects the overall visual theme of the game.
     * Resolved at runtime to the matching skin folder / CSS bundle.
     */
    skin: string;

    /**
     * Display name of the mini-game template shown to players and in the
     * Back-Office listing.  Supports translations via
     * `saw_template_ui_definition._translations.<lang>.name`.
     */
    name: string;

    /**
     * HTML-capable description / rules text shown to the player before or
     * during the game.  Supports translations via
     * `saw_template_ui_definition._translations.<lang>.description`.
     */
    description?: string;

    /**
     * URL of the thumbnail image (typically 256 × 256 px) shown in
     * mini-game selection lists and galleries.
     */
    thumbnail?: string;

    // ─── Spin-limit messaging ─────────────────────────────────────────────────

    /**
     * HTML-capable message shown to a player who has reached the maximum
     * number of allowed attempts for the current period.
     * Rendered when the server rejects a spin with
     * `SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED`.
     * Supports translations via
     * `saw_template_ui_definition._translations.<lang>.over_limit_message`.
     *
     * Only relevant when `max_spins_count` is configured on the template.
     */
    over_limit_message?: string;

    /**
     * HTML-capable message shown when the player has no spin attempts or
     * insufficient points / gems / diamonds to play.
     * Supports translations via
     * `saw_template_ui_definition._translations.<lang>.no_attempts_message`.
     *
     * Only relevant for buy-in types `Spins`, `Points`, `Gems`, or `Diamonds`.
     */
    no_attempts_message?: string;

    // ─── Game structure ───────────────────────────────────────────────────────

    /**
     * Number of prize sectors on the wheel or gift-box grid.
     * For Spin-the-Wheel games the Back-Office enforces a range of 3 – 10.
     */
    sectors_count: number;

    /**
     * Relative display order of the mini-game within a list.
     * Lower values appear first.  Configurable in the Back-Office
     * "Priority" field (Advanced section).
     */
    priority: number;

    /**
     * When `true` the mini-game is **excluded from the widget's automatic
     * game listing** and is only accessible when it is explicitly triggered
     * via a Campaign Flow Builder action or accessed by deep links or triggered over the api.
     *
     * Back-Office label:
     * _"Available only from campaign (won't be visible in the widget)"_
     *
     */
    flow_builder_only: boolean;

    // ─── Background assets ────────────────────────────────────────────────────

    /**
     * URL of the full-bleed background image shown on desktop devices.
     * Not used for Plinko and Coin Flip game types.
     */
    background_image?: string;

    /**
     * URL of the full-bleed background image shown on mobile devices.
     * Falls back to {@link background_image} when absent.
     * Not used for Plinko and Coin Flip game types.
     */
    background_image_mobile?: string;

    /**
     * URL of the audio file (MP3 / WAV) played as background music
     * during gameplay.  Silenced when {@link disable_background_music}
     * is `true` or the player has muted audio.
     */
    background_sound?: string;

    /**
     * Volume level of the background music, expressed as a percentage
     * in the range `0` – `100`.
     */
    background_music_volume?: number;

    /**
     * When `true`, background music is muted even if a
     * {@link background_sound} URL is provided.
     * Defaults to `true` in the Skin Editor preview scaffolding.
     */
    disable_background_music?: boolean;

    // ─── Spin / wheel configuration ───────────────────────────────────────────

    /**
     * Duration in milliseconds of the spin animation before the result
     * is revealed (e.g. `3000` = 3 seconds).
     * Applies to Spin-the-Wheel and similar animated game types.
     */
    spin_animation_duration?: number;

    /**
     * Rotation offset in degrees applied to the visual pointer / arrow
     * on the wheel to compensate for skin-specific alignment differences.
     */
    wheel_pointer_rotation?: number;

    /**
     * Screen positioning of the wheel relative to the game panel.
     *
     * | Value | Meaning |
     * | --- | --- |
     * | `SAWWheelLayout.Centered = 1` | Wheel centred in the panel |
     * | `SAWWheelLayout.LeftAligned = 2` | Wheel pinned to the left |
     * | `SAWWheelLayout.RightAligned = 3` | Wheel pinned to the right |
     * | `SAWWheelLayout.BottomAligned = 4` | Wheel pinned to the bottom |
     *
     * Applies to Spin-the-Wheel games only.
     * Back-Office label: _"Wheel layout"_.
     */
    wheel_layout?: SAWWheelLayout;

    // ─── Scratch-card assets ──────────────────────────────────────────────────

    /**
     * URL of the logo image overlaid on the scratch-card surface
     * before the player scratches.
     */
    scratch_logo?: string;

    /**
     * URL of the cover / foil image that the player scratches away
     * to reveal the prize beneath.
     */
    scratch_cover?: string;

    /**
     * URL of the background image shown behind the scratch card on
     * desktop devices.
     * Back-Office label: _"Scratch main desktop background"_.
     */
    scratch_bg_desktop?: string;

    /**
     * URL of the background image shown behind the scratch card on
     * mobile devices.
     * Back-Office label: _"Scratch main mobile background"_.
     */
    scratch_bg_mobile?: string;

    /**
     * URL of a custom cursor image used when the pointer hovers over
     * the scratchable area.
     * Back-Office label: _"Scratch mouse cursor"_.
     */
    scratch_cursor?: string;

    /**
     * When `true`, prize / reward names are hidden inside the scratch-card
     * UI so the player does not know what they won until they have fully
     * scratched the card.
     *
     * Only rendered for `SAWGameType.ScratchCard`.
     * Back-Office label: _"Hide prize names"_.
     */
    hide_prize_names?: boolean;

    // ─── Styling & customisation ──────────────────────────────────────────────

    /**
     * Raw CSS injected into the game iframe, allowing fine-grained
     * overrides beyond what the selected skin provides.
     */
    custom_css?: string;

    /**
     * Path to an alternative folder from which skin assets (images,
     * CSS, JS) are loaded instead of the default skin bundle.
     */
    custom_skin_folder?: string;

    // ─── Jackpot display ──────────────────────────────────────────────────────

    /**
     * Label / symbol appended to the jackpot amount to give it semantic
     * meaning (e.g. `"EUR"`, `"Free spins"`).
     * Displayed alongside {@link SAWTemplate.jackpot_current}.
     * Back-Office label: _"Jackpot symbol"_.
     */
    jackpot_symbol?: string;

    // ─── Promotional content ──────────────────────────────────────────────────

    /**
     * URL of a promotional banner image (recommended 500 × 240 px)
     * displayed inside the game UI to advertise an offer or campaign.
     * Supports per-language variants via
     * `saw_template_ui_definition.promo_image_<lang>`.
     */
    promo_image?: string;

    /**
     * HTML-capable promotional text displayed alongside
     * {@link promo_image}.  Supports translations via
     * `saw_template_ui_definition._translations.<lang>.promo_text`.
     */
    promo_text?: string;

    // ─── MatchX / Quiz specific ───────────────────────────────────────────────

    /**
     * URL of the banner image shown at the top of the MatchX / Quiz
     * tournament leaderboard on desktop.
     * Back-Office label: _"Banner"_.
     */
    matchx_banner?: string;

    /**
     * URL of the mobile-optimised banner image for the MatchX / Quiz
     * tournament leaderboard.
     */
    matchx_banner_mobile?: string;

    /**
     * When `true`, tournament rankings are reset on a seasonal cadence
     * rather than being continuous.
     */
    matchx_seasonal_ranking?: boolean;

    /**
     * When `true`, the MatchX / Quiz tournament has concluded.
     * New entries are blocked and the final leaderboard is shown.
     */
    matchx_is_completed?: boolean;

    /**
     * Maximum number of players visible on the general leaderboard
     * inside the MatchX / Quiz game.
     */
    matchx_general_board_users_count?: number;

    /**
     * When `true`, the ranking / leaderboard panel is hidden from
     * players inside the MatchX / Quiz game.
     * Back-Office label: _"Hide ranking"_.
     */
    matchx_hide_ranking?: boolean;

    // ─── Prize board ──────────────────────────────────────────────────────────

    /**
     * URL of an image used to illustrate the prize pool (e.g. a trophy
     * or coins graphic).
     */
    prize_pool_image?: string;

    /**
     * When `true`, a panel listing the available prizes is displayed
     * inside the game.
     *
     * Back-Office label: _"Show the list of the prizes"_.
     * Defaults to `true` in the MatchX / Quiz game form.
     */
    show_prize_board?: boolean;

    // ─── Spin cadence & countdown ─────────────────────────────────────────────

    /**
     * The rolling time-window in milliseconds within which
     * `SAWTemplate.maxSpinsCount` attempts are allowed
     * (e.g. `86400000` = 24 hours).
     *
     * Stored on the template root as `max_spins_period_ms`; mirrored here
     * for convenience in UI preview payloads.
     */
    max_spins_period_ms?: number;

    /**
     * When `true`, a countdown timer showing when the next spin becomes
     * available is displayed to the player.
     *
     * Only active when `max_spins_count === 1` **and** `max_spins_period_ms`
     * is set; automatically forced to `false`.
     *
     * Back-Office label: _"Show time to the next available spin"_.
     */
    show_countdown_for_next_availability?: boolean;

    // ─── Username prompt ──────────────────────────────────────────────────────

    /**
     * Controls when (or whether) the player is asked to provide a
     * display name before or after playing.
     *
     * | Value | Meaning |
     * | --- | --- |
     * | `SAWAskForUsername.NOASK = 'no-ask'` | Never ask |
     * | `SAWAskForUsername.ONSUMBIT = 'on-submit'` | Ask when submitting |
     *
     * Back-Office label: _"Ask for username"_.
     */
    ask_for_username?: SAWAskForUsername;

    // ─── Custom sections ──────────────────────────────────────────────────────

    /**
     * ID of the custom section (category / tab) this mini-game belongs to,
     * allowing operators to group games in bespoke widget sections.
     * Back-Office label: _"Custom section"_.
     */
    custom_section_id?: number;

    /**
     * When `true`, the template is shown **only** inside its assigned
     * custom section and is suppressed from all standard game listings.
     */
    only_in_custom_section?: boolean;

    // ─── Spin-ID exposure ─────────────────────────────────────────────────────

    /**
     * Determines which identifier is forwarded in webhooks and the
     * Retention API when a spin result is produced.
     *
     * | Value | Meaning |
     * | --- | --- |
     * | `SAWExposeUserSpinId.UserId = 1` | Expose the operator's external user ID |
     * | `SAWExposeUserSpinId.SpinId = 2` | Expose the internal spin transaction ID |
     *
     * Back-Office label:
     * _"Expose 'External user ID' or 'Spin transaction ID'"_.
     */
    expose_user_spin_id?: SAWExposeUserSpinId;

    // ─── Custom data ──────────────────────────────────────────────────────────

    /**
     * Arbitrary operator-defined payload attached to the template.
     * Can be a JSON object, plain string, or number.  Passed through to
     * the front-end as-is and accessible via the public API.
     * Back-Office label: _"Custom data field"_.
     */
    custom_data: any;

    // ─── Prize Drop specific ──────────────────────────────────────────────────

    /**
     * First free-form placeholder string used by Prize Drop game skins
     * to inject operator-defined copy into the game UI.
     */
    placeholder1?: string;

    /**
     * Second free-form placeholder string used by Prize Drop game skins
     * to inject operator-defined copy into the game UI.
     */
    placeholder2?: string;

    /**
     * Template definition for the Prize Drop game overlay.
     * `id` is the unique template identifier; `content` is the raw HTML
     * rendered inside the drop panel.
     */
    prize_drop_template?: {
        /** Unique identifier for this prize-drop HTML template. */
        id: string;
        /** HTML content rendered inside the prize-drop panel. */
        content: string;
    };

    // ─── Lootbox specific ────────────────────────────────────────────────────

    /**
     * Visual arrangement of items in Lootbox (Weekly / Calendar Days)
     * game types.
     *
     * | Value | Meaning |
     * | --- | --- |
     * | `SAWGameLayout.Horizontal = 1` | Items laid out in a horizontal row |
     * | `SAWGameLayout.VerticalMap = 2` | Items arranged as a vertical map path |
     *
     * Back-Office label: _"Visual layout"_.
     */
    game_layout?: SAWGameLayout;

    // ─── Treasure Hunt specific ───────────────────────────────────────────────

    /**
     * Total number of path steps / cells a player must progress through
     * to complete a Treasure Hunt game and receive the final prize.
     * Higher values result in longer gameplay sessions.
     * Back-Office label: _"Steps to finish game"_.
     */
    steps_to_finish_game?: number;

    // ─── Voyager specific ────────────────────────────────────────────────────

    /**
     * Difficulty level of the Voyager (space-exploration) mini-game,
     * controlling obstacle frequency and game speed.
     *
     * | Value | Meaning |
     * | --- | --- |
     * | `SAWGameDifficultyType.EASY = 1` | Easy |
     * | `SAWGameDifficultyType.MEDIUM = 2` | Medium |
     * | `SAWGameDifficultyType.HARD = 3` | Hard |
     */
    game_difficulty?: SAWGameDifficultyType;
}