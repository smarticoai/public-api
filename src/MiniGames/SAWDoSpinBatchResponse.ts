import { ProtocolResponse } from '../Base/ProtocolResponse';
import { SAWDoSpinResponse } from './SAWDoSpinResponse';
import { SAWSpinErrorCode } from './SAWSpinErrorCode';

export interface SAWDoSpinBatchResponse extends ProtocolResponse {
	results: SAWDoSpinResponse[];
	errCode: SAWSpinErrorCode,
}
