import { RafflePrize } from "./RafflePrize";
import { RaffleTicket } from "./RaffleTicket";

interface RaffleDrawPublicMeta {
    /** Name of the draw, e.g. 'Daily draw' */
    name: string;
    /** Description of the draw */
    description: string;
    /** URL of the image that represents the draw */
    image_url: string;
    /** URL of the icon that represents the draw */
    icon_url: string;
    /** URL of the background image that will be used in the draw list item */
    background_image_url: string;
}

enum RaffleDrawInstanceState {
    /** Draw is open for the tickets collection */
    Open = 1,
    /** Winner selection is in progress */
    WinnerSelection = 2,
    /** Draw is executed and the winners are selected */
    Executed = 3,
}


interface RaffleDraw {
    /** 
     * Id of the Draw definition, for the repetative draws (e.g. daily), this number will be the same for all draws that are repeating daily
     * (internal name: schedule_id)
     */
    draw_id: number;

    /** Meta information of the Draw for the presentaiton in UI */
    public_meta: RaffleDrawPublicMeta;

    /** Information about prizes in the draw */
    prizes: RafflePrize[];

    /** 
     * State of current instance of Draw
     */
    current_state: RaffleDrawInstanceState;

    /** 
     * Field indicates the ID of the latest instance/run of draw
    */
    run_id: number;    

    /** Date/time of the draw execution */
    execution_ts: number;
    
    /** Date of the previously executed draw (if there is such) */
    previous_run_ts?: number;

    /** Unique ID of the previusly executed draw (if there is such) */
    previous_run_id?: number;    

    /**
     *  Date/time starting from which the tickets will participate in the upcoming draw
     *  This value need to be taken into account with next_execute_ts field value, for example
     *  Next draw is at 10:00, ticket_start_date is 9:00, so all tickets that are collected after 9:00 will participate in the draw at 10:00
     *  (internally this value is calculated as next_execute_ts - ticket_start_date)
     */
    ticket_start_date: number;

    /** Field is indicating if same ticket can win multiple prizes in the same draw 
     *  For example there are 3 types of prizes in the draw - iPhone, iPad, MacBook
     *  If this field is true, then one ticket can win all 3 prizes (depending on the chances of course), 
     *  if false, then one ticket can win only one prize. 
     *  The distribution of the prizes is start from top (assuming on top are the most valuable prizes) to bottom (less valuable prizes)
     *  If specific prize has multiple values, e.g. we have 3 iPhones, 
     *  then the same ticket can win only one prize of a kind, but can win multiple prizes of different kind (if allow_multi_prize_per_ticket is true) 
    */
    allow_multi_prize_per_ticket: boolean;


    /** 
     * The number of tickets that are already given to all users for this instance of draw.
     * In other words tickets that are collected between ticket_start_date and current time (or till current_execution_ts is the instance is executed).
     */
    total_tickets_count: number;

    /** 
     * The number of tickets collected by current user for this instance of draw.
     */
    my_tickets_count: number;

    /*
    * List of last 5 tickets are collected by current user for this instance of draw.
    */
    my_last_tickets: RaffleTicket[];
}


export { RaffleDraw }