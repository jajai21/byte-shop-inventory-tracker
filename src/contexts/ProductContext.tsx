
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PriceHistory } from '../types';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data: productsData, error: productsError } = await supabase
          .from('product')
          .select('*')
          .order('prodcode');

        if (productsError) {
          toast.error(`Error fetching products: ${productsError.message}`);
          return;
        }

        // Convert Supabase data to Product type
        const formattedProducts: Product[] = productsData.map(item => ({
          id: item.prodcode, // Using prodcode as ID
          code: item.prodcode,
          name: item.description || 'No Description',
          quantity: 0, // Default value since not in original table
          unit: item.unit || 'piece',
          price: 0, // Will be updated from price history
          category: 'Uncategorized', // Default category
          createdAt: new Date().toISOString()
        }));

        // Fetch price history
        const { data: historyData, error: historyError } = await supabase
          .from('pricehist')
          .select('*')
          .order('effdate', { ascending: false });

        if (historyError) {
          toast.error(`Error fetching price history: ${historyError.message}`);
          return;
        }

        // Convert Supabase data to PriceHistory type
        const formattedHistory: PriceHistory[] = historyData.map(item => ({
          id: `${item.prodcode}-${item.effdate}`, // Create a unique ID
          productId: item.prodcode,
          price: Number(item.unitprice) || 0,
          date: item.effdate
        }));

        // Update product prices with the most recent price
        const updatedProducts = formattedProducts.map(product => {
          const latestPrice = formattedHistory
            .filter(history => history.productId === product.code)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          return {
            ...product,
            price: latestPrice ? latestPrice.price : 0
          };
        });

        setProducts(updatedProducts);
        setPriceHistory(formattedHistory);
      } catch (error: any) {
        toast.error(`Error loading data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate next product code based on existing codes
  const getNextProductCode = () => {
    if (products.length === 0) {
      return 'PR0001';
    }
    
    // Extract numeric parts from existing codes
    const codes = products
      .map(p => p.code)
      .map(code => {
        const match = code.match(/^[A-Z]+(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const maxCode = Math.max(...codes);
    return `PR${String(maxCode + 1).padStart(4, '0')}`;
  };

  // Add a new product
  const addProduct = async (productData: Omit<Product, 'id' | 'code' | 'createdAt'>) => {
    try {
      const prodcode = getNextProductCode();
      
      // Insert new product into Supabase
      const { error: productError } = await supabase
        .from('product')
        .insert([{
          prodcode: prodcode,
          description: productData.name,
          unit: productData.unit
        }]);

      if (productError) {
        toast.error(`Error adding product: ${productError.message}`);
        return;
      }

      // Insert initial price history
      const { error: priceError } = await supabase
        .from('pricehist')
        .insert([{
          prodcode: prodcode,
          unitprice: productData.price,
          effdate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        }]);

      if (priceError) {
        toast.error(`Error adding price history: ${priceError.message}`);
        return;
      }

      // Create formatted Product object for state
      const newProduct: Product = {
        id: prodcode,
        code: prodcode,
        name: productData.name,
        quantity: productData.quantity,
        unit: productData.unit,
        price: productData.price,
        category: productData.category,
        createdAt: new Date().toISOString()
      };

      // Update local state
      setProducts(prev => [...prev, newProduct]);
      setPriceHistory(prev => [
        ...prev,
        {
          id: `${prodcode}-${new Date().toISOString().split('T')[0]}`,
          productId: prodcode,
          price: productData.price,
          date: new Date().toISOString().split('T')[0]
        }
      ]);

      toast.success(`Product ${newProduct.name} added successfully`);
    } catch (error: any) {
      toast.error(`Error adding product: ${error.message}`);
    }
  };

  // Update an existing product
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const existingProduct = products.find(p => p.id === updatedProduct.id);
      
      // Update product in Supabase
      const { error: productError } = await supabase
        .from('product')
        .update({
          description: updatedProduct.name,
          unit: updatedProduct.unit
        })
        .eq('prodcode', updatedProduct.id);

      if (productError) {
        toast.error(`Error updating product: ${productError.message}`);
        return;
      }

      // Check if price has changed
      if (existingProduct && existingProduct.price !== updatedProduct.price) {
        // Add new price history entry
        const { error: priceError } = await supabase
          .from('pricehist')
          .insert([{
            prodcode: updatedProduct.id,
            unitprice: updatedProduct.price,
            effdate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
          }]);

        if (priceError) {
          toast.error(`Error updating price history: ${priceError.message}`);
          return;
        }

        // Update price history in local state
        setPriceHistory(prev => [
          ...prev,
          {
            id: `${updatedProduct.id}-${new Date().toISOString().split('T')[0]}`,
            productId: updatedProduct.id,
            price: updatedProduct.price,
            date: new Date().toISOString().split('T')[0]
          }
        ]);
      }

      // Update local state
      setProducts(prev => 
        prev.map(product => product.id === updatedProduct.id ? updatedProduct : product)
      );

      toast.success(`Product ${updatedProduct.name} updated successfully`);
    } catch (error: any) {
      toast.error(`Error updating product: ${error.message}`);
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      const productToDelete = products.find(product => product.id === id);
      if (!productToDelete) return;

      // Delete product from Supabase (cascade will handle price history deletion)
      const { error } = await supabase
        .from('product')
        .delete()
        .eq('prodcode', id);

      if (error) {
        toast.error(`Error deleting product: ${error.message}`);
        return;
      }

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      setPriceHistory(prev => prev.filter(history => history.productId !== id));

      toast.success(`Product ${productToDelete.name} deleted successfully`);
    } catch (error: any) {
      toast.error(`Error deleting product: ${error.message}`);
    }
  };

  // Get price history for a product
  const getProductPriceHistory = (productId: string) => {
    return priceHistory
      .filter(history => history.productId === productId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Search products by name, code, or category
  const searchProducts = (query: string) => {
    if (!query) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.code.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  };

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
