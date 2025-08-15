export interface SaleItem {
  id: number;
  sale_id: number;
  item_type: 'service' | 'product';
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface Sale {
  id: number;
  reservation_id?: number;
  barber_id: number;
  customer_name: string;
  service_amount: number;
  products_amount: number;
  total_amount: number;
  payment_method: string;
  sale_date: Date;
  created_at: Date;
  updated_at: Date;

  // Joined data
  items?: SaleItem[];
}
