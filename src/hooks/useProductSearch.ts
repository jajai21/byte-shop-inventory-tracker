
import { useMemo } from "react";
import { Product, PriceHistory } from "@/types";
import { searchProductsList, getProductPriceHistoryList } from "@/utils/productUtils";

export const useProductSearch = (
  products: Product[],
  priceHistory: PriceHistory[]
) => {
  const getProductPriceHistory = (productId: string) => {
    return getProductPriceHistoryList(priceHistory, productId);
  };

  const searchProducts = (query: string) => {
    return useMemo(() => {
      return searchProductsList(products, query);
    }, [products, query]);
  };

  return {
    searchProducts,
    getProductPriceHistory
  };
};
