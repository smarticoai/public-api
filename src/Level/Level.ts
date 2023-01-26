import { LevelPublicMeta } from "./LevelPublicMeta";

export interface Level {

    level_id: number;
    level_public_meta: LevelPublicMeta;
    required_points: number;
    is_first_level: boolean;
    /** Internal status of level. Not in use right now on the front-end */
    level_status_id: number;
    required_level_counter_1: number;
    required_level_counter_2: number;
    general_level_progress: number;
}
