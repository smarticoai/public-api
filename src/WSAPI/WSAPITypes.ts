import { MiniGamePrizeTypeName, SAWBuyInTypeName, SAWGameTypeName, SAWPrizeType, SAWPrizeUI, SAWSpinErrorCode } from "../MiniGames";
import { TournamentRegistrationStatusName, TournamentRegistrationTypeName } from "../Tournaments";

type TRibbon = 'sale' | 'hot' | 'new' | 'vip' | string


/**
 * TMiniGamePrize describes the information of prize in the array of prizes in the TMiniGameTemplate
*/
export interface TMiniGamePrize {
    /** ID of the prize */
    id: number;
    /** The visual name of the prize */
    name: string;
    /** The type of the prize,  no-prize, points, bonus, manual, spin, jackpot */
    prize_type: MiniGamePrizeTypeName;
    /** Numeric value of the prize in case it's pints or spin type */
    prize_value?: number;
    /** Custom font size for the prize */
    font_size?: number;
    /** The URL of the icon of the prize */
    icon?: string;
}


/**
 * TMiniGamePlayResult describes the response of call to _smartico.api.playMiniGame(template_id) method
*/
export interface TMiniGamePlayResult {
    /** Error code that represents outcome of the game play attempt. Game succeed to be played in case err_code is 0 */
    err_code: SAWSpinErrorCode;
    /** Optional error message */
    err_message: string;
    /** The prize_id that user won, details of the prize can be found in the mini-game definition */
    prize_id: number;
}


/**
 * TMiniGameTemplate describes the information of mini-games available for the user
*/
export interface TMiniGameTemplate {
    /** ID of the mini-game template */
    id: number;
    /** Name of the mini-game template, translated to the user language */
    name: string;
    /** Description of the mini-game template, translated to the user language */
    description: string;
    /** URL of the icon of the mini-game template */
    thumbnail: string;

    /** The type of the game, e.g. Spin the Wheel, Gift Box, Scratch card, MatchX etc */
    saw_game_type: SAWGameTypeName;
    /** How the user is charged for each game attempt e.g. Free, Points or Spin attempts */
    saw_buyin_type: SAWBuyInTypeName;    

    // in case of charging type 'Points', what is the points amount will be deducted from user balance
    buyin_cost_points: number;
    // in case of charging type 'Spin attempts', shows the current number of spin attempts that user has
    spin_count?: number; 

    // if the game is limit to the number of spins that user can do during period of time, this property shows the epoch time in UTC when the next attempt will be available
    next_availabe_spin_ts: number;


    /** The message that should be shown to the user when he cannot play the game, server rejected attempt with error code SAWSpinErrorCode.SAW_FAILED_MAX_SPINS_REACHED */
    over_limit_message: string;
    /** The message that should be shown to the user when he cannot play the game because he doesn't have spin attempts or points. */
    no_attempts_message: string;

    /** Current jackpont amount, if jackpot is enabled. */
    jackpot_current: number;
    /** The amount that will be added to the jackpot every time when somebody plays the game. Note that the contribution amount is abstract, means that no money or points are deducted from the user balance. */
    jackpot_add_on_attempt: number;
    /** The symbol of jackpot that is giving the sense to the 'amount' E.g. the symbol could be EUR and connected to the amount it can indicate that amount is monetary, e.g. '100 EUR'. Or the symbol can be 'Free spins' and connected to the amount it can indicate that amount is number of free spins, e.g. '100 Free spins'.
     */
    jackpot_symbol: string;
        
    prizes: TMiniGamePrize[];

}




/**
 * TUser describes the information of the user
 * The user object is returned by _smartico.api.getUserProfile() method.
 * If you want to track the changes of the user profile, you can subscribe to the callback in the following way
 *  _smartico.on('props_change', () => console.log(_smartico.api.getUserProfile()) );
*/

export interface TUserProfile {
    /** The language of the user */
    core_user_language: string;
    /** The current points balance that user can use in the Store, Mini-games, Tournaments, etc.. */
    ach_points_balance: number;
    /** The amount of points that user collected in total */
    ach_points_ever: number;
    /** 
     * The array of the public tags set on the user object. 
     * They can be treated as server-based cookies. 
     * You can set tags using following method _smartico.event('core_public_tags_update', { core_public_tags: ['A', 'B'] } );
     * And then you can check for the tags
    */  
    core_public_tags: string[];
    /** The ID of the current level of the user */
    ach_level_current_id?: number;
    /** The indicator if user is marked as test user */
    core_is_test_account?: boolean;
    /** The URL to the user avatar */
    avatar_url?: string;
    /** The username of current user */
    public_username?: string;
    /** THe number of unread inbox messages */
    core_inbox_unread_count?: number;
}

/** 
 * TLevel describes the information of each level defined in the system
 * There is no order of the levels, but it can be calculated using required_points property
 * The current level of user can be taken from the user object using ach_level_current_id property
 * The progress to the next level can be calculated using ach_points_ever and required_points properties of next level
 */
export interface TLevel {

    /** The ID of the Level */
    id: number,
    /** The name of the Level, translated to the user language */
    name: string,
    /** The description of the Level, translated to the user language */
    description: string,
    /** The URL of the image of the Level */
    image: string,
    /** The amount of points required to reach the Level */
    required_points: number,
    /** Number of points that user should collect in order to see this level */
    visibility_points: number;    
    /** 
     * The counter of 1st metric used to reach the Level. 
     * Relevant in case of using advanced leveling logic
     * https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users
     * 
    */
    required_level_counter_1: number,
    /** 
     * The counter of 2nd metric used to reach the Level. 
     * Relevant in case of using advanced leveling logic
     * https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users
     * 
    */    
    required_level_counter_2: number,
}

/** 
 * TTournament describes the general information of the tournament item
 */

export interface TTournament {
    /** ID of tournament instance. Generated every time when tournament based on specific template is scheduled for run */
    instance_id: number;
    /** ID of tournament template */
    tournament_id: number;
    /** Name of the tournament, translated to the user language */
    name: string;
    /** Description of the tournament, translated to the user language */
    description: string;
    /* 1st image URL representing the tournament */
    image1: string;
    /* 2nd image URL representing the tournament */
    image2: string;
    /* The message indicating the prize pool of the tournament */
    prize_pool_short: string;
    /* The message indicating the price to register in the tournament */
    custom_price_text: string;

    /** The message that should be shown to the user when the user cannot register in tournament with error code TOURNAMENT_USER_DONT_MATCH_CONDITIONS  */
    segment_dont_match_message: string;
    /** 
     * The ID of the custom section where the tournament is assigned
     * The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)
    */
    custom_section_id: number;
    /** The custom data of the tournament defined by operator. Can be a JSON object, string or number */
    custom_data: any;

    /** The indicator if the tournament is 'Featured' */
    is_featured: boolean;

    /** The ribbon of the tournament item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon */
    ribbon: TRibbon;

    /** The time when tournament is going to start, epoch with milliseconds */
    start_time: number;
    /** The time when tournament is going to finish, epoch with milliseconds */
    end_time: number;
    /** Type of registration in the tournament */
    registration_type: TournamentRegistrationTypeName,
    /** Number of users registered in the tournament */
    registration_count: number;
    /** flag indicating if current user is registered in the tournament */
    is_user_registered: boolean;
    /** Minimum number of participant for this tournament. If tournament doesnt have enough registrations, it will not start */
    players_min_count: number;
    /** Maximum number of participant for this tournament. When reached, new users won't be able to register */
    players_max_count: number;
    /** Status of registration in the tournament for current user */
    registration_status: TournamentRegistrationStatusName,
    /** Tournament duration in millisecnnds */
    duration_ms: number;

    /** Cost of registration in the tournament in gamification points */
    registration_cost_points: number;

    /** Indicator if tournament instance is active, means in one of the statues -  PUBLISHED, REGISTED, STARTED */
    is_active: boolean;
    
    /** Indicator if user can register in this tournament instance, e.g tournament is active, max users is not reached, user is not registered yet */
    is_can_register: boolean;
    /** Indicator if tournament instance is cancelled (status CANCELLED) */
    is_cancelled: boolean;
    /** Indicator if tournament instance is finished (status FINISHED, CANCELLED OR FINIALIZING) */
    is_finished: boolean;
    /** Indicator if tournament instance is running (status STARTED) */
    is_in_progress: boolean;
    /** Indicator if tournament instance is upcoming (status PUBLISHED or REGISTER) */
    is_upcoming: boolean;
}

/** 
 * TTournamentDetailed describes the information of the tournament item and includes list of participants, their scores and position in the tournament leaderboard
 */
export interface TTournamentDetailed extends TTournament {
    
    /** The list of the tournament participants */
    players?: {
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
    }[],
    /** The information about current user in the tournament if he is registered in the tournamnet */
    me?: {
        /** The username of the current user */
        public_username: string;
        /** The URL to the avatar of the current user */
        avatar_url: string;
        /** The position of the current user in the tournament */
        position: number;
        /** The scores of the current user in the tournament */
        scores: number;
    }

};

/** 
 * TStoreCategory describes the store category item. Each store item can be assigned to 1 or more categories
 */
export interface TStoreCategory {
    id: number;
    name: string;
    order: number
}

/** 
 * TStoreItem describes the information of the store item defined in the system
 */
export interface TStoreItem {
    /** ID of the store item  */
    id: number;
    /** Name of the store item, translated to the user language */
    name: string;
    /** Description of the store item, translated to the user language */
    description: string;
    /** URL of the image of the store item */
    image: string;    
    /** Type of the store item. Can be 'bonus' or 'manual'. Manual, means it's tangible item, e.g. iPhone */
    type: 'bonus' | 'manual';
    /** The price of the store item in the gamification points */
    price: number;
    /** The ribbon of the store item. Can be 'sale', 'hot', 'new', 'vip' or URL to the image in case of custom ribbon */
    ribbon: TRibbon;
    /** 
     *  The message that should be shown to the user if he is not eligible to buy it. this message can be used to explain the reason why user cannot buy the item, e.g. 'You should be VIP to buy this item' and can be used in case can_buy property is false.
        The message is translated to the user language.
        **Note**: when user is trying to buy the item, the response from server can return custom error messages that can be shown to the user as well
    */
    limit_message: string;
    /** The priority of the store item. Can be used to sort the items in the store */
    priority: number;
    /** The list of IDs of the related items. Can be used to show the related items in the store */
    related_item_ids: number[];    
    /** The indicator if the user can buy the item
     *  This indicator is taking into account the segment conditions for the store item, the price of item towards users balance, 
    */
    can_buy: boolean;
    /** The list of IDs of the categories where the store item is assigned, information about categories can be retrievend with getStoreCategories method */
    category_ids: number[];
}

/** 
 * TMissionOrBadge describes the information of mission or badge defined in the system
 */
export interface TMissionOrBadge {
    /** ID of the mission or badge  */
    id: number;
    /** Type of entity. Can be 'mission' or 'badge' */
    type: 'mission' | 'badge',
    /** Name of the mission or badge, translated to the user language */
    name: string;
    /** Description of the mission or badge, translated to the user language */
    desription: string;
    /** Description of the mission reward if defined */
    reward: string;
    /** URL of the image of the mission or badge */
    image: string;
    /** Indicator if the mission is completed or badge is granted */
    is_completed: boolean;
    /** Indicator if the mission is locked. Means that it's visible to the user, but he cannot progress in it until it's unlocked.
     * Mission may optionally contain the explanation of what should be done to unlock it in the unlock_mission_description property
     */
    is_locked: boolean;
    /** Optional explaination of what should be done to unlock the mission */
    unlock_mission_description: string;
    /** Indicator if the mission requires opt-in. Means that user should explicitly opt-in to the mission in order to start progressing in it */
    is_requires_optin: boolean;
    /** Indicator if the user opted-in to the mission */
    is_opted_in: boolean;
    /** The amount of time in milliseconds that user has to complete the mission */
    time_limit_ms: number
    /** The date when the mission was started, relevant for the time limited missions */
    dt_start: number;
    /** The progress of the mission in percents calculated as the aggregated relative percentage of all tasks */
    progress: number;
    /** 
     * The action that should be performed when user clicks on the mission or badge
     * Can be URL or deep link, e.g. 'dp:deposit'. The most safe to execute CTA is to pass it to _smartico.do(cta_action);
     * The 'dp' function will handle the CTA and will execute it in the most safe way
     */
    cta_action: string,
    /** The text of the CTA button, e.g. 'Make a deposit' */
    cta_text: string,
    /** 
     * The ID of the custom section where the mission or badge is assigned
     * The list of custom sections can be retrieved using _smartico.api.getCustomSections() method (TODO-API)
    */
    custom_section_id: number,
    /** The indicator if the mission or badge is visible only in the custom section and should be hidden from the main overview of missions/badges */
    only_in_custom_section: boolean,
    /** The custom data of the mission or badge defined by operator. Can be a JSON object, string or number */
    custom_data: any,

    /** The list of tasks of the mission or badge */
    tasks: TMissionOrBadgeTask[]
}

/** 
 * TMissionOrBadgeTask describes the information of tasks that belings to mission or badge. See also TMissionOrBadge
 */
export interface TMissionOrBadgeTask {
    /** ID of the task */
    id: number,
    /** Name of the task, translated to the user language */
    name: string,
    /** Indicator if the task is completed */
    is_completed: boolean,
    /** The progress of the task in percents */
    progress: number
}