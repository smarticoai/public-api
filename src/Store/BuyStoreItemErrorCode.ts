export enum BuyStoreItemErrorCode {
	/** User don't have enough points on balance */
	SHOP_NO_BALANCE = 11000,
	/** Wrong shop item id */
	SHOP_WRONG_LABEL = 11001,
	/** Failed to buy bonus item, probably something wrong with the bonus configuration. */
	SHOP_FAILED_TO_BUY_BONUS = 11002, // remote product restriction
	/** Failed to buy store item because segment conditions are set by operator for specific CRM item */
	SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION = 11003, // when not visible but trying to buy. shouldn't happen
	/**  Segment conditions are set by operator for specific CRM item and user not matching to this conditions */
	SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION_PURSHASE = 11004, // when visible but not matching to purchase segment
	/** Failed to buy matching bonus item */
	SHOP_FAILED_TO_BUY_MATCHING_BONUS = 11005,
	/** Failed to buy item because of limit of max items is reached */
	SHOP_FAILED_MAX_BOUGHT_ITEMS_REACHED = 11006,
	/** Failed to buy item because no more items are available */
	SHOP_FAILED_POOL_EMPTY = 11009,
	/** User doesn't have enough gems on balance */
	SHOP_NO_BALANCE_GEMS = 11011,
	/** User doesn't have enough diamonds on balance */
	SHOP_NO_BALANCE_DIAMONDS = 11012,
}
