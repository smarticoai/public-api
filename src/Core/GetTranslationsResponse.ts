import { ProtocolResponse } from '../Base/ProtocolResponse'

export interface GetTranslationsResponse extends ProtocolResponse {
	hash_code: number
	translations: { [key: string]: string }
}
