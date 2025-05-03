
import { Product, PriceHistory } from "@/types";

// Format Supabase product data to Product type
export const formatProductData = (
  productsData: any[], 
  priceHistoryData: any[]
): Product[] => {
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

  // Convert Supabase data to PriceHistory type
  const formattedHistory: PriceHistory[] = priceHistoryData.map(item => ({
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

  return updatedProducts;
};

// Generate next product code based on existing codes
export const generateNextProductCode = (products: Product[]) => {
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

// Search products by name, code, or category
export const searchProductsList = (products: Product[], query: string) => {
  if (!query) return products;
  
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.code.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
};

// Get price history for a specific product
export const getProductPriceHistoryList = (priceHistory: PriceHistory[], productId: string) => {
  return priceHistory
    .filter(history => history.productId === productId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
