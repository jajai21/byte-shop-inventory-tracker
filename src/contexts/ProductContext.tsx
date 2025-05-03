
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
          .from('products')
          .select('*')
          .order('name');

        if (productsError) {
          toast.error(`Error fetching products: ${productsError.message}`);
          return;
        }

        // Convert Supabase data to Product type
        const formattedProducts: Product[] = productsData.map(item => ({
          id: item.id,
          code: item.code,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: Number(item.price),
          category: item.category,
          createdAt: item.created_at
        }));

        setProducts(formattedProducts);

        // Fetch price history
        const { data: historyData, error: historyError } = await supabase
          .from('price_history')
          .select('*')
          .order('date');

        if (historyError) {
          toast.error(`Error fetching price history: ${historyError.message}`);
          return;
        }

        // Convert Supabase data to PriceHistory type
        const formattedHistory: PriceHistory[] = historyData.map(item => ({
          id: item.id,
          productId: item.product_id,
          price: Number(item.price),
          date: item.date
        }));

        setPriceHistory(formattedHistory);
      } catch (error: any) {
        toast.error(`Error loading data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate next product code based on category
  const getNextProductCode = () => {
    return `CP${String(products.length + 1).padStart(4, '0')}`;
  };

  // Add a new product
  const addProduct = async (productData: Omit<Product, 'id' | 'code' | 'createdAt'>) => {
    try {
      const prefix = productData.category.substring(0, 2).toUpperCase();
      
      // Find the highest code number for this category
      const categoryCodes = products
        .filter(p => p.code.startsWith(prefix))
        .map(p => parseInt(p.code.substring(2), 10));
      
      const nextCodeNumber = categoryCodes.length > 0 
        ? Math.max(...categoryCodes) + 1 
        : 1;

      const code = `${prefix}${String(nextCodeNumber).padStart(4, '0')}`;

      // Insert new product into Supabase
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          code: code,
          name: productData.name,
          quantity: productData.quantity,
          unit: productData.unit,
          price: productData.price,
          category: productData.category
        }])
        .select()
        .single();

      if (productError) {
        toast.error(`Error adding product: ${productError.message}`);
        return;
      }

      // Insert initial price history
      const { error: priceError } = await supabase
        .from('price_history')
        .insert([{
          product_id: newProduct.id,
          price: productData.price,
          date: new Date().toISOString()
        }]);

      if (priceError) {
        toast.error(`Error adding price history: ${priceError.message}`);
        return;
      }

      // Convert to our Product type
      const formattedProduct: Product = {
        id: newProduct.id,
        code: newProduct.code,
        name: newProduct.name,
        quantity: newProduct.quantity,
        unit: newProduct.unit,
        price: Number(newProduct.price),
        category: newProduct.category,
        createdAt: newProduct.created_at
      };

      // Update local state
      setProducts(prev => [...prev, formattedProduct]);
      setPriceHistory(prev => [
        ...prev,
        {
          id: Date.now().toString(), // Temporary ID until we get the real one
          productId: newProduct.id,
          price: Number(newProduct.price),
          date: new Date().toISOString()
        }
      ]);

      toast.success(`Product ${formattedProduct.name} added successfully`);
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
        .from('products')
        .update({
          name: updatedProduct.name,
          quantity: updatedProduct.quantity,
          unit: updatedProduct.unit,
          price: updatedProduct.price,
          category: updatedProduct.category
        })
        .eq('id', updatedProduct.id);

      if (productError) {
        toast.error(`Error updating product: ${productError.message}`);
        return;
      }

      // Check if price has changed
      if (existingProduct && existingProduct.price !== updatedProduct.price) {
        // Add new price history entry
        const { error: priceError } = await supabase
          .from('price_history')
          .insert([{
            product_id: updatedProduct.id,
            price: updatedProduct.price,
            date: new Date().toISOString()
          }]);

        if (priceError) {
          toast.error(`Error updating price history: ${priceError.message}`);
          return;
        }

        // Update price history in local state
        setPriceHistory(prev => [
          ...prev,
          {
            id: Date.now().toString(), // Temporary ID until we get the real one
            productId: updatedProduct.id,
            price: updatedProduct.price,
            date: new Date().toISOString()
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

      // Delete product from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

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
