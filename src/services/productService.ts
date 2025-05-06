import { supabase } from "@/integrations/supabase/client";
import { Product, PriceHistory } from "@/types";
import { toast } from "@/components/ui/sonner";

// Fetch products from Supabase
export const fetchProducts = async () => {
  const { data: productsData, error: productsError } = await supabase
    .from('product')
    .select('*')
    .order('prodcode');

  if (productsError) {
    throw new Error(`Error fetching products: ${productsError.message}`);
  }

  return productsData;
};

// Fetch price history from Supabase
export const fetchPriceHistory = async () => {
  const { data: historyData, error: historyError } = await supabase
    .from('pricehist')
    .select('*')
    .order('effdate', { ascending: false });

  if (historyError) {
    throw new Error(`Error fetching price history: ${historyError.message}`);
  }

  return historyData;
};

// Add a new product to Supabase
export const addProductToDatabase = async (
  prodcode: string,
  productData: Omit<Product, 'id' | 'code' | 'createdAt'>
) => {
  // Insert new product into Supabase
  const { error: productError } = await supabase
    .from('product')
    .insert([{
      prodcode: prodcode,
      description: productData.name,
      unit: productData.unit
    }]);

  if (productError) {
    throw new Error(`Error adding product: ${productError.message}`);
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
    throw new Error(`Error adding price history: ${priceError.message}`);
  }

  return prodcode;
};

// Update an existing product in Supabase
export const updateProductInDatabase = async (updatedProduct: Product) => {
  // Update product in Supabase
  const { error: productError } = await supabase
    .from('product')
    .update({
      description: updatedProduct.name,
      unit: updatedProduct.unit
    })
    .eq('prodcode', updatedProduct.id);

  if (productError) {
    throw new Error(`Error updating product: ${productError.message}`);
  }

  return updatedProduct;
};

// Add new price history entry in Supabase
export const addPriceHistoryEntry = async (productId: string, price: number) => {
  // Create today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Check if a price entry for today already exists
  const { data: existingEntries, error: checkError } = await supabase
    .from('pricehist')
    .select('*')
    .eq('prodcode', productId)
    .eq('effdate', today);
    
  if (checkError) {
    throw new Error(`Error checking price history: ${checkError.message}`);
  }
  
  // If an entry for today exists, update it
  if (existingEntries && existingEntries.length > 0) {
    const { error: updateError } = await supabase
      .from('pricehist')
      .update({ unitprice: price })
      .eq('prodcode', productId)
      .eq('effdate', today);
      
    if (updateError) {
      throw new Error(`Error updating price history: ${updateError.message}`);
    }
  } else {
    // Otherwise insert a new entry
    const { error: priceError } = await supabase
      .from('pricehist')
      .insert([{
        prodcode: productId,
        unitprice: price,
        effdate: today
      }]);

    if (priceError) {
      throw new Error(`Error updating price history: ${priceError.message}`);
    }
  }

  return {
    id: `${productId}-${today}`,
    productId: productId,
    price: price,
    date: today
  };
};

// Delete a product from Supabase
export const deleteProductFromDatabase = async (id: string) => {
  // First delete price history records (they have a foreign key relationship)
  const { error: historyError } = await supabase
    .from('pricehist')
    .delete()
    .eq('prodcode', id);

  if (historyError) {
    throw new Error(`Error deleting price history: ${historyError.message}`);
  }

  // Then delete the product
  const { error } = await supabase
    .from('product')
    .delete()
    .eq('prodcode', id);

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
