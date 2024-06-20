
interface JackPotWinner {
    is_me: boolean;
    public_username: string; // masked for all except "is_me"
    winning_amount_jp_currency: number;
    winning_amount_wallet_currency: number;
    winning_position: number
}

export { JackPotWinner }