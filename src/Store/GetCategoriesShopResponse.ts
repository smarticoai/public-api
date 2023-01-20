import { ProtocolResponse } from "../Base/ProtocolResponse";
import { ShopCategory } from "./ShopCategory";


export interface GetCategoriesShopResponse extends ProtocolResponse {

    categories: ShopCategory[];
}



