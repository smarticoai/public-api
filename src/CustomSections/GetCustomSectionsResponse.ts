import { ProtocolResponse } from '../Base/ProtocolResponse';
import { UICustomSection } from './UICustomSection';

export interface GetCustomSectionsResponse extends ProtocolResponse {
	customSections: { [key: string]: UICustomSection };
}
