import { ProtocolResponse } from '../Base/ProtocolResponse';

/**
 * The label's widget disclaimer ("additional T&C") text, resolved for the
 * current player.
 *
 * The value is the configured disclaimer with its personalisation placeholders
 * substituted. Placeholders that cannot be resolved are left as-is rather than
 * blanked. May be `null` or an empty string when no disclaimer is configured,
 * in which case nothing should be rendered. The text may contain HTML.
 */
export interface TermsAndConditionsResponse extends ProtocolResponse {
	/** The resolved disclaimer text, or `null` / `''` when none is configured. */
	widget_disclaimer_text?: string;
}
