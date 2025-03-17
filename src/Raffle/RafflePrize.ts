import { RafflePrizeWinner } from "./RafflePrizeWinner";


interface RafflePrizePublicMeta {
    /** Name of the prize */
    name: string;
    /** Description of the prize */
    description: string;
    /** URL of the image that represents the prize */
    image_url: string;
}

/**
 * Represents a prize in a draw.
 */
interface RafflePrize {

    /**
     * The unique identifier for the prize definition
     */
    prize_id: string;

    /**
     * Meta information about the prize for presentation in the UI.
     */
    public_meta: RafflePrizePublicMeta;

    /**
     * The number of prizes available per run of the draw.
     * E.g. if the draw is run daily, this is the number of prizes available each day, for example 3 iPhones.
     */
    prizes_per_run: number;

    /**
     * The actual number of prizes for the current instance.
     * This value is taking into account follwing values:
     *  - min_required_total_tickets, 
     *  - add_one_prize_per_each_x_tickets
     *  - stock_items_per_draw
     *  - total_tickets_count (from Draw instance)
     *  - cap_prizes_per_run
     * For example:
     *  - prizes_per_run = 1
     *  - min_required_total_tickets = 1000
     *  - add_one_prize_per_each_x_tickets = 1000
     *  - stock_items_per_draw = 5
     *  - total_tickets_count = 7000
     *  - cap_prizes_per_run = 6
     *  prizes_per_run_actual will be 5, because
     *  7000 tickets are collected, so 7 iPhones are available, but the cap is 6 and the stock is 5.
    */
    prizes_per_run_actual: number;


    /**
     * 
     * The chances to win the prize by current player. 
     * Calculated as the ratio of the number of tickets collected by the current player to the 
     * total number of tickets collected by all players and multiplied by number of actual prizes of this kind.
     */
    chances_to_win_perc: number;

    /**
     * The minimum number of total tickets collected during draw period required to unlock the prize.
     * If the number of tickets collected is less than this value, the prize is not available.
     * Under total tickets we understand the number of tickets collected by all users.
     * The 'draw period' is the time between the ticket_start_date value of the draw and the current time.
     */
    min_required_total_tickets?: number;

    /**
     * One additional prize will be awarded for each X tickets.
     * E.g. if the prize is 1 iPhone and the value is set to 1000, then for every 1000 tickets collected, an additional iPhone is awarded.
     * If min_required_total_tickets is set to 1000, then next iPhone is awarded when 2000 tickets are collected, and so on.
     * If min_required_total_tickets is not set, then the next iPhone will be awarded when 1000 tickets are collected.
     */
    add_one_prize_per_each_x_tickets?: number;

    /**
     * Indicates whether the prize requires a claim action from the user.
     */
    requires_claim: boolean;

    /**
     * The minimum number of tickets a user must have to be eligible for the prize.
     * For example iPhone prize may require 10 tickets to be collected, only users with 10 or more tickets will be eligible for the prize.
     * More tickets are better, as they increase the chances of winning.
     */
    min_required_tickets_for_user: number;


    /**
     * The maximum number of prizes that can be given withing one instance/run of draw.
     * For example the prize is iPhone and add_one_prize_per_each_x_tickets is set to 1000, 
     * cap_prizes_per_run is set to 3, and the total number of tickets collected is 7000.
     * In this case, the prizes_per_run_actual will be limitted by 3
     */ 
    cap_prizes_per_run?: number;


    /**
     * The priority of the prize. The low number means higher priority (e.g. 1 is higher priority than 2).
     * If there are multiple prizes available, the prize with the highest priority (lowest number) will be awarded first.
     */
    priority: number;

    /**
     * Optional field that indicates total remaining number of the prize for all draws of the type.
     * For example, the Daily draw has 1 iPhone daily, and the total number of iPhones is 10.
     * the stock_items_per_draw will be decreasing by 1 each day (assuming there is enough tickets and it is won every day), and when it reaches 0, the prize is not available anymore.
     */
    stock_items_per_draw?: number;

	/**
	 * Shows if the prize has been claimed
	 */
	should_claim: boolean;

	winners: RafflePrizeWinner[];
}

export { RafflePrize }