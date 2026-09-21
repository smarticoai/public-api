import { ProtocolMessage } from '../Base/ProtocolMessage';

/**
 * Asks for the label's widget disclaimer ("additional T&C") text with any
 * personalisation placeholders already resolved for the current player.
 *
 * Requires an identified session — the text is resolved against the player's
 * own state, so it cannot be requested before identification.
 */
export interface TermsAndConditionsRequest extends ProtocolMessage {
	/** Overrides the session language used to resolve the text. Defaults to the player's language. */
	force_language?: string;
}
