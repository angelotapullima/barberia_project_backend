export interface Barber {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  photo_url?: string;
  station_id?: number;
  base_salary: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
