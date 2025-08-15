export interface ReservationProduct {
  id: number;
  reservation_id: number;
  product_id: number;
  quantity: number;
  price_at_reservation: number;
  created_at: Date;
}

export interface Reservation {
  id: number;
  barber_id: number;
  station_id: number;
  service_id: number;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'paid' | 'cancelled';
  service_price: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  
  // Optional fields for joins
  barber_name?: string;
  station_name?: string;
  service_name?: string;
  products?: ReservationProduct[];
}
