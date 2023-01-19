import { ProtocolResponse } from "../Base/ProtocolResponse";
import { PublicProperties } from "./PublicProperties";

interface ResponseIdentify extends ProtocolResponse {
    user_id: number;
    ext_user_id: string;
    public_username: string;
    avatar_id: string;
    job: boolean;
    props?: PublicProperties;
    pubic_username_set: boolean; 
 }
 
 export { ResponseIdentify }