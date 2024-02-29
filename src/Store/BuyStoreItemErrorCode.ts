export enum BuyStoreItemErrorCode {
    FAILED_TO_BUY_SHOP_ITEM = 121,
    SHOP_NO_BALANCE = 11000,
    SHOP_WRONG_LABEL = 11001,
    SHOP_FAILED_TO_BUY_BONUS = 11002, // remote product restriction
    SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION = 11003, // when not visible but trying to buy. Shoudnt happen
    SHOP_FAILED_TO_BUY_SHOP_ITEM_CONDITION_PURSHASE = 11004, // when visible but not matching to purchase segment
    SHOP_FAILED_TO_BUY_MATCHING_BONUS = 11005,
    SHOP_FAILED_MAX_BOUGHT_ITEMS_REACHED = 11006,
    SHOP_FAILED_POOL_EMPTY = 11009,
}