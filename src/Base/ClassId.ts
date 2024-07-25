export enum ClassId {
    PING = 1,
    PONG = 2,


    INIT = 3,
    INIT_RESPONSE = 4,
    IDENTIFY = 5,
    IDENTIFY_RESPONSE = 6,
    LOGIN = 7,
    LOGOUT = 8,
    EVENT = 9,
    EVENT_RESPONSE = 10,

    LOGIN_RESPONSE = 11,
    LOGOUT_RESPONSE = 12,

    GET_TRANSLATIONS_REQUEST = 13,
    GET_TRANSLATIONS_RESPONSE = 14,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    

    CLIENT_ENGAGEMENT_IMPRESSION_REQUEST = 103,
    CLIENT_ENGAGEMENT_ACTION_REQUEST = 104,
    CLIENT_EXECUTE_DEEPLINK_EVENT = 105,
    CLIENT_ENGAGEMENT_FAILED_REQUEST = 106,
    CLIENT_EXECUTE_JS_EVENT = 107,
    CLIENT_PUBLIC_PROPERTIES_CHANGED_EVENT = 108,
    CLIENT_ENGAGEMENT_EVENT_NEW = 110,

    CLIENT_TRACK_ACTIVITY_REQUEST = 155,
    CLIENT_SET_AVATAR_REQUEST = 157,
    CLIENT_SET_AVATAR_RESPONSE = 158,

    CLIENT_SET_CUSTOM_USERNAME_REQUEST = 159,
    CLIENT_SET_CUSTOM_USERNAME_RESPONSE = 160,

    CHECK_SEGMENT_MATCH_REQUEST = 161,
    CHECK_SEGMENT_MATCH_RESPONSE = 162,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    

    // 500-1000 - Achievements
    GET_LEVEL_MAP_REQUEST = 500,
    GET_LEVEL_MAP_RESPONSE = 501,
    GET_ACHIEVEMENT_MAP_REQUEST = 502,
    GET_ACHIEVEMENT_MAP_RESPONSE = 503,
    RELOAD_ACHIEVEMENTS_EVENT = 504,
    GET_LEADERS_BOARD_REQUEST = 505,
    GET_LEADERS_BOARD_RESPONSE = 506,
    GET_SHOP_ITEMS_REQUEST = 509,
    GET_SHOP_ITEMS_RESPONSE = 510,
    BUY_SHOP_ITEM_REQUEST = 511,
    BUY_SHOP_ITEM_RESPONSE = 512,
    GET_INBOX_MESSAGES_REQUEST = 513,
    GET_INBOX_MESSAGES_RESPONSE = 514,
    GET_SHOP_CATEGORIES_REQUEST = 515,
    GET_SHOP_CATEGORIES_RESPONSE = 516,
    GET_TOURNAMENT_LOBBY_REQUEST = 517,
    GET_TOURNAMENT_LOBBY_RESPONSE = 518,
    GET_TOURNAMENT_INFO_REQUEST = 519,
    GET_TOURNAMENT_INFO_RESPONSE = 520,
    TOURNAMENT_REGISTER_REQUEST = 521,
    TOURNAMENT_REGISTER_RESPONSE = 522,
    GET_CUSTOM_SECTIONS_REQUEST = 523,
    GET_CUSTOM_SECTIONS_RESPONSE = 524,
    MISSION_OPTIN_REQUEST = 525,
    MISSION_OPTIN_RESPONSE = 526,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    

    GET_ACHIEVEMENT_USER_REQUEST = 527,
    GET_ACHIEVEMENT_USER_RESPONSE = 528,

    MARK_INBOX_READ_REQUEST = 529,
    MARK_INBOX_READ_RESPONSE = 530,
    MARK_INBOX_STARRED_REQUEST = 531,
    MARK_INBOX_STARRED_RESPONSE = 532,
    MARK_INBOX_DELETED_REQUEST = 535,
    MARK_INBOX_DELETED_RESPONSE = 536,

    GET_ACH_CATEGORIES_REQUEST = 537,
    GET_ACH_CATEGORIES_RESPONSE = 538,

    ACHIEVEMENT_CLAIM_PRIZE_REQUEST = 539,
    ACHIEVEMENT_CLAIM_PRIZE_RESPONSE = 540,

    ACH_SHOP_ITEM_HISTORY_REQUEST = 541,
    ACH_SHOP_ITEM_HISTORY_RESPONSE = 542,

    GET_RELATED_ACH_N_TOURNAMENTS_REQUEST = 543,
    GET_RELATED_ACH_N_TOURNAMENTS_RESPONSE = 544,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    

    GET_BONUSES_REQUEST = 600,
    GET_BONUSES_RESPONSE = 601,
    CLAIM_BONUS_REQUEST = 602,
    CLAIM_BONUS_RESPONSE = 603,

    SAW_GET_SPINS_REQUEST = 700,
    SAW_GET_SPINS_RESPONSE = 701,
    SAW_DO_SPIN_REQUEST = 702,
    SAW_DO_SPIN_RESPONSE = 703,
    SAW_AKNOWLEDGE_REQUEST = 704,
    SAW_AKNOWLEDGE_RESPONSE = 705,
    SAW_SPINS_COUNT_PUSH = 706,
    SAW_SHOW_SPIN_PUSH = 707,
    SAW_PRIZE_DROP_WIN_PUSH = 708,
    SAW_PRIZE_DROP_WIN_AKNOWLEDGE_REQUEST = 709,
    SAW_PRIZE_DROP_WIN_AKNOWLEDGE_RESPONSE = 710,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    


    JP_GET_JACKPOTS_REQUEST = 800,
    JP_GET_JACKPOTS_RESPONSE = 801,

    JP_GET_LATEST_POTS_REQUEST = 802,
    JP_GET_LATEST_POTS_RESPONSE = 803,

    JP_OPTIN_REQUEST = 804,
    JP_OPTIN_RESPONSE = 805,

    JP_OPTOUT_REQUEST = 806,
    JP_OPTOUT_RESPONSE = 807,

    JP_WIN_PUSH = 808,

    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */

    REGISTER_PUSH_NOTIFICATIONS_TOKEN_REQ = 1003,
    REGISTER_PUSH_NOTIFICATIONS_TOKEN_RESP = 2003,

    CLIENT_DEBUG_REQUEST = 77777,

    
    /*
        !Important, if adding new messages that are 'acting' on behalf of the client,
        you need to include them in the CLASS_ID_IGNORE_FOR_SIMULATION
    */    

    UNSUPPORTED_COMMAND = 99999,
}