export interface ClanPublicMeta {
	name: string;
	description: string;
	image_url: string;
}

export interface Clan {
	clan_id: number;
	public_meta: ClanPublicMeta;
	member_count: number;
	capacity_limit: number;
	/** ShopPurchaseType: 0=Points, 1=Gems, 2=Diamonds, 3=Free */
	entry_fee_currency_type_id: number;
	entry_fee_amount: number;
	/** F1 rank ASC, 1=best */
	rating_position: number;
	rating_score: number;
}
