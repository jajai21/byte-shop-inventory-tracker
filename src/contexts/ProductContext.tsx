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

// Imported products from the SQL statement
const importedProducts: Product[] = [
  {
    id: '11',
    code: 'AD0001',
    name: 'Toshiba Canvio 1 TB',
    quantity: 10,
    unit: 'ea',
    price: 79.99,
    category: 'Storage',
    createdAt: new Date().toISOString()
  },
  {
    id: '12',
    code: 'AD0002',
    name: 'WD Ultra 1TB',
    quantity: 15,
    unit: 'ea',
    price: 89.99,
    category: 'Storage',
    createdAt: new Date().toISOString()
  },
  {
    id: '13',
    code: 'AD0003',
    name: 'Seagate Bracuda 1TB',
    quantity: 12,
    unit: 'ea',
    price: 84.99,
    category: 'Storage',
    createdAt: new Date().toISOString()
  },
  {
    id: '14',
    code: 'AD0004',
    name: 'Transcend 1 TB',
    quantity: 8,
    unit: 'ea',
    price: 74.99,
    category: 'Storage',
    createdAt: new Date().toISOString()
  },
  {
    id: '15',
    code: 'AD0006',
    name: 'Chuables',
    quantity: 20,
    unit: 'ea',
    price: 29.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '16',
    code: 'AD001',
    name: 'Keyboard',
    quantity: 30,
    unit: 'ea',
    price: 10.00,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '17',
    code: 'AD002',
    name: 'Mouse',
    quantity: 25,
    unit: 'ea',
    price: 5.00,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '18',
    code: 'AD003',
    name: 'Monitor',
    quantity: 10,
    unit: 'ea',
    price: 199.99,
    category: 'Monitor',
    createdAt: new Date().toISOString()
  },
  {
    id: '19',
    code: 'AD004',
    name: 'USB Cable',
    quantity: 50,
    unit: 'ea',
    price: 7.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '20',
    code: 'AD005',
    name: 'Headphones',
    quantity: 15,
    unit: 'ea',
    price: 29.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  // More products being added
  {
    id: '21',
    code: 'AD006',
    name: 'Webcam',
    quantity: 20,
    unit: 'ea',
    price: 45.00,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '22',
    code: 'AD007',
    name: 'Mousepad',
    quantity: 40,
    unit: 'ea',
    price: 12.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '23',
    code: 'AD008',
    name: 'HDMI Cable',
    quantity: 35,
    unit: 'ea',
    price: 15.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '24',
    code: 'AE0009',
    name: 'Microphone',
    quantity: 10,
    unit: 'ea',
    price: 59.99,
    category: 'Peripheral',
    createdAt: new Date().toISOString()
  },
  {
    id: '25',
    code: 'AK0001',
    name: 'HP Pavilion DV6000',
    quantity: 5,
    unit: 'pc',
    price: 599.99,
    category: 'Laptop',
    createdAt: new Date().toISOString()
  }
];

// Sample additional price history
const additionalPriceHistory: PriceHistory[] = [
  { id: '7', productId: '11', price: 89.99, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '8', productId: '11', price: 84.99, date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '9', productId: '11', price: 79.99, date: new Date().toISOString() },
  { id: '10', productId: '12', price: 99.99, date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '11', productId: '12', price: 94.99, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '12', productId: '12', price: 89.99, date: new Date().toISOString() }
];

// Combine the original sample products with the new imported products
const allSampleProducts = [
  // Original sample products
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
  },
  // Add the new imported products
  ...importedProducts
];

// Combine the original sample price history with the new additional price history
const allPriceHistory = [
  // Original price history
  { id: '1', productId: '1', price: 449.99, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', productId: '1', price: 429.99, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', productId: '1', price: 399.99, date: new Date().toISOString() },
  { id: '4', productId: '3', price: 799.99, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', productId: '3', price: 749.99, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', productId: '3', price: 699.99, date: new Date().toISOString() },
  // Add the additional price history
  ...additionalPriceHistory
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
      setProducts(allSampleProducts);
      localStorage.setItem('byteshop_products', JSON.stringify(allSampleProducts));
    }

    // Load price history from localStorage or use sample data
    const storedPriceHistory = localStorage.getItem('byteshop_price_history');
    if (storedPriceHistory) {
      setPriceHistory(JSON.parse(storedPriceHistory));
    } else {
      setPriceHistory(allPriceHistory);
      localStorage.setItem('byteshop_price_history', JSON.stringify(allPriceHistory));
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
