import { ProtocolResponse } from '../Base/ProtocolResponse'
import { Tournament } from './Tournament'
import { TournamentRegistrationStatus } from './TournamentRegistrationStatus'
import { TournamentRegistrationType } from './TournamentRegistrationType'
import { TournamentUtils } from './TournamentUtils'

export interface GetTournamentsResponse extends ProtocolResponse {
	/** array of the tournaments */
	tournaments?: Tournament[]
}
