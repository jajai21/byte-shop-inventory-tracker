
import React, { createContext, useContext, useEffect } from 'react';
import { Product, PriceHistory } from '../types';
import { useProductOperations } from '@/hooks/useProductOperations';
import { useProductSearch } from '@/hooks/useProductSearch';

interface ProductContextType {
  products: Product[];
  priceHistory: PriceHistory[];
  addProduct: (product: Omit<Product, 'id' | 'code' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getNextProductCode: () => string;
  getProductPriceHistory: (productId: string) => PriceHistory[];
  searchProducts: (query: string) => Product[];
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    products,
    priceHistory,
    isLoading,
    loadProducts,
    getNextProductCode,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProductOperations();

  const {
    searchProducts,
    getProductPriceHistory
  } = useProductSearch(products, priceHistory);

  // Fetch products from Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      priceHistory,
      addProduct,
      updateProduct,
      deleteProduct,
      getNextProductCode,
      getProductPriceHistory,
      searchProducts,
      isLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
};
