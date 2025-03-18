import { RaffleDrawPublicMeta } from "./RaffleDrawPublicMeta";

interface RaffleDrawRun {
    /**
     * Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
     * (internal name: schedule_id)
     */
    draw_id: number;

    /**
     * Field indicates the ID of the latest instance/run of draw
     */
    run_id: number;

    /** Meta information of the Draw for the presentaiton in UI */
    public_meta: RaffleDrawPublicMeta;


    /** Date/time of the draw execution */
    execution_ts: number;

    /** Actual Date/time of the draw execution */
    actual_execution_ts: number;

    /**
     *  Date/time starting from which the tickets will participate in the upcoming draw
     *  This value need to be taken into account with next_execute_ts field value, for example
     *  Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
     *  (internally this value is calculated as next_execute_ts - ticket_start_date)
     */
    ticket_start_ts: number;

    /**
     * Shows if user has won a prize in a current run
     */
    is_winner: boolean;

    /**
     * Shows if user has unclaimed prize
     */
    has_unclaimed_prize: boolean;
}

export { RaffleDrawRun };
