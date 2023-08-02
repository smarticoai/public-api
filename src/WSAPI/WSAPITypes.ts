
/**
 * TUser interface describes the information of the user
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
 * TLevel interface describes the information of each level defined in the system
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
 * TMissionOrBadge interface describes the information of mission or badge defined in the system
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
 * TMissionOrBadgeTask interface describes the information of tasks that belings to mission or badge. See also TMissionOrBadge
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