
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PriceHistory } from '../types';
import { toast } from "@/components/ui/sonner";

interface ProductContextType {
  products: Product[];
  priceHistory: PriceHistory[];
  addProduct: (product: Omit<Product, 'id' | 'code' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getNextProductCode: () => string;
  getProductPriceHistory: (productId: string) => PriceHistory[];
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Sample computer products data
const sampleProducts: Product[] = [
  {
    id: '1',
    code: 'CP0001',
    name: 'AMD Ryzen 9 5900X Processor',
    quantity: 15,
    unit: 'piece',
    price: 399.99,
    category: 'Processor',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    code: 'MB0001',
    name: 'ASUS ROG Strix B550-F Gaming Motherboard',
    quantity: 8,
    unit: 'piece',
    price: 189.99,
    category: 'Motherboard',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    code: 'GP0001',
    name: 'NVIDIA GeForce RTX 3080 Graphics Card',
    quantity: 5,
    unit: 'piece',
    price: 699.99,
    category: 'Graphics Card',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    code: 'RM0001',
    name: 'Corsair Vengeance RGB Pro 32GB DDR4 RAM',
    quantity: 20,
    unit: 'kit',
    price: 149.99,
    category: 'Memory',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    code: 'SS0001',
    name: 'Samsung 970 EVO Plus 1TB NVMe SSD',
    quantity: 25,
    unit: 'piece',
    price: 129.99,
    category: 'Storage',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    code: 'PS0001',
    name: 'Corsair RM850x Power Supply',
    quantity: 12,
    unit: 'piece',
    price: 129.99,
    category: 'Power Supply',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    code: 'CS0001',
    name: 'NZXT H510 Mid Tower Case',
    quantity: 10,
    unit: 'piece',
    price: 69.99,
    category: 'Case',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    code: 'CL0001',
    name: 'NZXT Kraken X63 RGB AIO CPU Cooler',
    quantity: 7,
    unit: 'piece',
    price: 149.99,
    category: 'Cooling',
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    code: 'MN0001',
    name: 'Dell S2721DGF 27" QHD Gaming Monitor',
    quantity: 6,
    unit: 'piece',
    price: 329.99,
    category: 'Monitor',
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    code: 'KB0001',
    name: 'Logitech G Pro X Mechanical Keyboard',
    quantity: 18,
    unit: 'piece',
    price: 129.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  }
];

// Sample price history
const samplePriceHistory: PriceHistory[] = [
  { id: '1', productId: '1', price: 449.99, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', productId: '1', price: 429.99, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', productId: '1', price: 399.99, date: new Date().toISOString() },
  { id: '4', productId: '3', price: 799.99, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', productId: '3', price: 749.99, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', productId: '3', price: 699.99, date: new Date().toISOString() }
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  useEffect(() => {
    // Load products from localStorage or use sample data
    const storedProducts = localStorage.getItem('byteshop_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(sampleProducts);
      localStorage.setItem('byteshop_products', JSON.stringify(sampleProducts));
    }

    // Load price history from localStorage or use sample data
    const storedPriceHistory = localStorage.getItem('byteshop_price_history');
    if (storedPriceHistory) {
      setPriceHistory(JSON.parse(storedPriceHistory));
    } else {
      setPriceHistory(samplePriceHistory);
      localStorage.setItem('byteshop_price_history', JSON.stringify(samplePriceHistory));
    }
  }, []);

  // Helper function to save products to localStorage
  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('byteshop_products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  // Helper function to save price history to localStorage
  const savePriceHistory = (newPriceHistory: PriceHistory[]) => {
    localStorage.setItem('byteshop_price_history', JSON.stringify(newPriceHistory));
    setPriceHistory(newPriceHistory);
  };

  // Generate next product code based on category
  const getNextProductCode = () => {
    return `CP${String(products.length + 1).padStart(4, '0')}`;
  };

  // Add a new product
  const addProduct = (productData: Omit<Product, 'id' | 'code' | 'createdAt'>) => {
    const prefix = productData.category.substring(0, 2).toUpperCase();
    
    // Find the highest code number for this category
    const categoryCodes = products
      .filter(p => p.code.startsWith(prefix))
      .map(p => parseInt(p.code.substring(2)));
    
    const nextCodeNumber = categoryCodes.length > 0 
      ? Math.max(...categoryCodes) + 1 
      : 1;

    const newProduct: Product = {
      id: Date.now().toString(),
      code: `${prefix}${String(nextCodeNumber).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      ...productData
    };

    const newProducts = [...products, newProduct];
    saveProducts(newProducts);

    // Add initial price history entry
    const newPriceHistoryEntry: PriceHistory = {
      id: Date.now().toString(),
      productId: newProduct.id,
      price: newProduct.price,
      date: new Date().toISOString()
    };

    const newPriceHistory = [...priceHistory, newPriceHistoryEntry];
    savePriceHistory(newPriceHistory);

    toast.success(`Product ${newProduct.name} added successfully`);
  };

  // Update an existing product
  const updateProduct = (updatedProduct: Product) => {
    const newProducts = products.map(product =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    
    saveProducts(newProducts);

    // Check if price has changed
    const existingProduct = products.find(p => p.id === updatedProduct.id);
    if (existingProduct && existingProduct.price !== updatedProduct.price) {
      // Add new price history entry
      const newPriceHistoryEntry: PriceHistory = {
        id: Date.now().toString(),
        productId: updatedProduct.id,
        price: updatedProduct.price,
        date: new Date().toISOString()
      };

      const newPriceHistory = [...priceHistory, newPriceHistoryEntry];
      savePriceHistory(newPriceHistory);
    }

    toast.success(`Product ${updatedProduct.name} updated successfully`);
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    const productToDelete = products.find(product => product.id === id);
    if (!productToDelete) return;

    const newProducts = products.filter(product => product.id !== id);
    saveProducts(newProducts);

    toast.success(`Product ${productToDelete.name} deleted successfully`);
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
      searchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};
