import { ProtocolResponse } from "../Base/ProtocolResponse";

export interface GetLabelInfoResponse extends ProtocolResponse {
    settings: { [key: string]: string },
    label_id: string,
  }