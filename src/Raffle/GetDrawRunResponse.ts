import { ProtocolResponse } from '../Base/ProtocolResponse';
import { RaffleDraw } from './RaffleDraw';

export interface GetDrawRunResponse extends ProtocolResponse {
	draw: RaffleDraw;
}
