import { IntUtils } from "src/IntUtils";
import { ProtocolResponse } from "../Base/ProtocolResponse";
import { TLevel } from "../WSAPI/WSAPITypes";
import { Level } from "./Level";

export interface  GetLevelMapResponse extends ProtocolResponse {

    levels: Level[];
}


export const GetLevelMapResponseTransform = (levels: GetLevelMapResponse): TLevel[] => {
    
    return levels?.levels.map((l => ({
        id: l.level_id,
        name: l.level_public_meta.name,
        description: l.level_public_meta.description,
        image: l.level_public_meta.image_url,
        required_points: l.required_points,
        visibility_points: parseInt(l.level_public_meta.visibility_points as any),
        required_level_counter_1: l.required_level_counter_1,
        required_level_counter_2: l.required_level_counter_2,
        custom_data: IntUtils.JsonOrText(l.level_public_meta?.custom_data),
    })));
}