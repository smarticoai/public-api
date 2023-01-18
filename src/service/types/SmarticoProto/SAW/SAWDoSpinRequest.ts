import { ProtocolRequest } from "./ProtocolRequest";


export interface SAWDoSpinRequest extends ProtocolRequest {

    request_id: string; // guid
    saw_template_id: number;
}
