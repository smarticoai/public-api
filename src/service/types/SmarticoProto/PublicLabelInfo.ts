export enum PublicLabelSettings {
    FCM_SENDER_ID = "FCM_SENDER_ID",
    PUBLIC_API_URL = "PUBLIC_API_URL",
    FCM_SW_URL = "FCM_SW_URL",
    RECORDING_ENABLED_FOR_ALL_USERS = "RECORDING_ENABLED_FOR_ALL_USERS",
    JS_INJECTION = "JS_INJECTION",
    GAMIFICATION_UI_MAIN = "GAMIFICATION_UI_MAIN",
    GAMIFICATION_UI_WIDGET = "GAMIFICATION_UI_WIDGET",
    GAMIFICATION_UI_MINI_GAME = "GAMIFICATION_UI_MINI_GAME",
    GAMIFICATION_UI_SETTINGS = "GAMIFICATION_UI_SETTINGS",
    GAMIFICATION_UI_MAIN_TEST = "GAMIFICATION_UI_MAIN_TEST",
    GAMIFICATION_UI_WIDGET_TEST = "GAMIFICATION_UI_WIDGET_TEST",
    GAMIFICATION_UI_SETTINGS_TEST = "GAMIFICATION_UI_SETTINGS_TEST",
    FRONT_END_ALLOWED_LANGUAGES = "FRONT_END_ALLOWED_LANGUAGES",
    FRONT_END_ALLOW_DOMAINS = "FRONT_END_ALLOW_DOMAINS",
    DELAY_ENGAGEMENT_EXECUTION_ON_LOGIN_MS = "DELAY_ENGAGEMENT_EXECUTION_ON_LOGIN_MS",
    SHADOW_LABEL_PUBLIC_KEY = "SHADOW_LABEL_PUBLIC_KEY",
    DYNAMIC_IMAGE_DOMAIN = "DYNAMIC_IMAGE_DOMAIN",
  
    GAMIFICATION_UI_LEVEL_ENABLED = "GAMIFICATION_UI_LEVEL_ENABLED",
    GAMIFICATION_UI_LEVEL_IMAGE_MOB = "GAMIFICATION_UI_LEVEL_IMAGE_MOB",
    GAMIFICATION_UI_LEVEL_IMAGE_DESK = "GAMIFICATION_UI_LEVEL_IMAGE_DESK",
  
    GAMIFICATION_LEVELS_LOGIC2 = "GAMIFICATION_LEVELS_LOGIC2",
  
    AVATAR_CUSTOM_IMAGE_MAX_ID = "AVATAR_CUSTOM_IMAGE_MAX_ID",
    AVATAR_CUSTOM_IMAGE_FOLDER = "AVATAR_CUSTOM_IMAGE_FOLDER",
  
    RETENTION_GAMES_CUSTOMER_ID = "RETENTION_GAMES_CUSTOMER_ID",
  
    GAMIFICATION_SHOW_POWERED_BY = "GAMIFICATION_SHOW_POWERED_BY",
    _system_leader_board_mask_username = "_system_leader_board_mask_username",
}


export interface ResponseIdentifyLabelInfo {
  settings: { [key: string]: string },
  label_id: string,
}