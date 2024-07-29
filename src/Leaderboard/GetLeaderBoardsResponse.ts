import { ProtocolResponse } from '../Base/ProtocolResponse'
import { LeaderBoardDetails } from './LeaderBoardDetails'

export interface GetLeaderBoardsResponse extends ProtocolResponse {
	map: { [key: string]: LeaderBoardDetails }
}
