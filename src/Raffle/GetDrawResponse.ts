import { ProtocolResponse } from '../Base/ProtocolResponse';
import { RaffleDraw } from './RaffleDraw';

export interface GetDrawResponse extends ProtocolResponse {
	draw: RaffleDraw;
}
