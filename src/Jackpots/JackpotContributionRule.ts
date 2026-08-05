import { JackpotContributionType } from './JackpotContributionType';

/**
 * One per-game / per-provider override of a jackpot's default contribution.
 *
 * When a qualifying bet matches a rule's `extEntityIds`, that rule's
 * `contributionValue` and `type` are used instead of the template-level
 * `contribution_value` / `contribution_type`. Rules are informational for
 * consumers — the server applies them. Note the camelCase field names; the rest
 * of the jackpot payload is snake_case.
 */
interface JackpotContributionRule {
	/** Stable ID of the rule within its template */
	ruleId: number;
	/** Template this rule belongs to */
	jpTemplateId: number;
	/** Whether `contributionValue` is a fixed amount or a percentage; see {@link JackpotContributionType} */
	type: JackpotContributionType;
	/** Operator-side game or provider IDs this rule applies to */
	extEntityIds: string[];
	/** Contribution to apply for matching bets — fixed amount or percentage depending on `type` */
	contributionValue: number;
}

export { JackpotContributionRule };
