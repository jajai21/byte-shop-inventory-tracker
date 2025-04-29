
export interface User {
  id: string;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  date: string;
}
