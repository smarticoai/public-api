enum GamePickMarketType {
    Goals = 1,
    Winner = 2,
}

enum GamePickResolutionType {
    None = 0,
    Lost = 2,
    PartialWin = 3,
    FullWin = 4,
}

enum GPRoundStatus {
    Other = -1,
    NoEventsDefined = 1,
    NoMoreBetsAllowed = 2,
    AllEventsResolved_ButNotRound = 3,
    RoundResolved = 4
}

interface GamePickEventMeta {
    event_name?: string;        
    team1_name: string;
    team1_image: string;
    team2_name: string;
    team2_image: string;
    team1_result?: number;
    team2_result?: number;
}

interface GamePickEvent {
    gp_event_id: number;
    event_resolution_date: number;
    match_date: number;
    market_type_id: GamePickMarketType;
    event_meta: GamePickEventMeta;
    user_placed_bet: boolean;
    team1_user_selection: number;
    team2_user_selection: number;
    resolution_type_id: GamePickResolutionType;
    resolution_score?: number;
    is_open_for_bets?: boolean;
}

interface GamePickRoundBase {
    round_id: number;
    round_row_id: number;
    round_name: string;
    round_description: string;
    open_date: number,
    last_bet_date: number;
    resolution_date: number;
    score_full_win: number;
    score_part_win: number;
    score_lost: number;
    is_active_now: boolean;
    is_resolved: boolean;
    round_status_id: GPRoundStatus;
    events_total: number;
    events_resolved: number;
    public_meta: {
        round_name: string;
        round_description: string;
        _translations: {[key: string] : {
            round_name: string;
            round_description: string;
        }}
    }
    next_round_open_date: number;
}

interface GamePickRoundBoard extends GamePickRoundBase {
    my_user: GamePickBoardUser;
    users: GamePickBoardUser[];
}

interface GamePickRound extends GamePickRoundBase {
    events: GamePickEvent[];
    user_score: number;
    user_placed_bet: boolean;
    has_open_for_bet_events?: boolean;
    has_not_submitted_changes?: boolean;
}

interface GamePickBoardUser {
    ext_user_id: string;
    int_user_id: number;
    public_username: string;
    avatar_url: string;
    gp_position: number;
    resolution_score: number;
    full_wins_count: number;
    part_wins_count: number;
    lost_count: number;
}



export { 
    GamePickRoundBase, GamePickRound, GamePickEvent, 
    GamePickMarketType, GamePickResolutionType, GamePickEventMeta, GPRoundStatus,
    GamePickRoundBoard,
    GamePickBoardUser
 };