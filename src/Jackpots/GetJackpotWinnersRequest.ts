import { ProtocolRequest } from "src/Base/ProtocolRequest";

interface GetJackpotWinnersRequest extends ProtocolRequest {
	/** The ID of the jackpot template */
	jp_template_id: number;
	/** The number of winners to return */
	limit: number;
	/** The offset of the winners to return */
	offset: number;
}

export { GetJackpotWinnersRequest };
