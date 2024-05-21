
interface JackpotPot {
    jp_template_id: number;
    jp_pot_id: number;
    current_pot_amount: number;
    explode_date_ts: number;
    // last_exploded_pot?: JackpotPot;
}

export { JackpotPot }