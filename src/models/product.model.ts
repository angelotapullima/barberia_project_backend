export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  category?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
