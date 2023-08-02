import { GetLevelMapResponse } from "../Level"

// Levels

/** @group Levels response */
export interface GetLevelMapClearedResponse {

    id: number,
    name: string,
    description: string,
    image: string,
    required_points: number,
    required_level_counter_1: number,
    required_level_counter_2: number,
}

/** @hidden */
export const levelCleaner = (levels: GetLevelMapResponse): GetLevelMapClearedResponse[] => {
    
    return levels?.levels.map((l => ({
        id: l.level_id,
        name: l.level_public_meta.name,
        description: l.level_public_meta.description,
        image: l.level_public_meta.image_url,
        required_points: l.required_points,
        required_level_counter_1: l.required_level_counter_1,
        required_level_counter_2: l.required_level_counter_2,
    })));
}