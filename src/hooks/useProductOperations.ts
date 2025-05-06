
import { useState } from "react";
import { Product, PriceHistory } from "@/types";
import { toast } from "@/components/ui/sonner";
import { 
  fetchProducts, 
  fetchPriceHistory, 
  addProductToDatabase, 
  updateProductInDatabase, 
  addPriceHistoryEntry, 
  deleteProductFromDatabase 
} from "@/services/productService";
import { formatProductData, generateNextProductCode } from "@/utils/productUtils";

export const useProductOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all products and price history
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      const productsData = await fetchProducts();
      const historyData = await fetchPriceHistory();
      
      // Format the data
      const formattedProducts = formatProductData(productsData, historyData);
      
      // Convert Supabase data to PriceHistory type
      const formattedHistory: PriceHistory[] = historyData.map(item => ({
        id: `${item.prodcode}-${item.effdate}`, // Create a unique ID
        productId: item.prodcode,
        price: Number(item.unitprice) || 0,
        date: item.effdate
      }));
      
      setProducts(formattedProducts);
      setPriceHistory(formattedHistory);
      
    } catch (error: any) {
      toast.error(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate next product code
  const getNextProductCode = () => {
    return generateNextProductCode(products);
  };

  // Add a new product
  const addProduct = async (productData: Omit<Product, 'id' | 'code' | 'createdAt'>) => {
    try {
      const prodcode = getNextProductCode();
      
      // Add product to database
      await addProductToDatabase(prodcode, productData);

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
      
      // Update product in database
      await updateProductInDatabase(updatedProduct);

      // Check if price has changed
      if (existingProduct && existingProduct.price !== updatedProduct.price) {
        // Add new price history entry
        const newPriceHistory = await addPriceHistoryEntry(updatedProduct.id, updatedProduct.price);

        // Update price history in local state
        setPriceHistory(prev => {
          // Check if we already have an entry for today
          const todaysDate = new Date().toISOString().split('T')[0];
          const existingTodayEntry = prev.find(
            h => h.productId === updatedProduct.id && h.date === todaysDate
          );
          
          if (existingTodayEntry) {
            // Update the existing entry
            return prev.map(entry => 
              entry.id === existingTodayEntry.id 
                ? { ...entry, price: updatedProduct.price } 
                : entry
            );
          } else {
            // Add new entry
            return [...prev, newPriceHistory];
          }
        });
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

      // Delete product from database
      await deleteProductFromDatabase(id);

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      setPriceHistory(prev => prev.filter(history => history.productId !== id));

      toast.success(`Product ${productToDelete.name} deleted successfully`);
    } catch (error: any) {
      toast.error(`Error deleting product: ${error.message}`);
    }
  };
  
  return {
    products,
    priceHistory,
    isLoading,
    loadProducts,
    getNextProductCode,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
