export type UserRole = 'admin' | 'reporter' | 'driver' | 'partner';

export type EventStatus = 'scheduled' | 'assigned' | 'reported' | 'completed' | 'cancelled';

export type RecoveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export type DeliveryStatus = 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

export type NeedLevel = 'high' | 'medium' | 'low';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  active: boolean;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  end_time: string;
  expected_attendees?: number;
  food_type?: string;
  catering_company?: string;
  reporter_id?: number;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  status: EventStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryReport {
  id: number;
  event_id: number;
  reporter_id: number;
  has_food: boolean;
  food_quantity?: string;
  food_description?: string;
  photo_urls?: string[];
  notes?: string;
  reported_at: string;
  status: RecoveryStatus;
  event_title?: string;
  event_location?: string;
  event_latitude?: number;
  event_longitude?: number;
  reporter_name?: string;
  reporter_phone?: string;
}

export interface Delivery {
  id: number;
  recovery_report_id: number;
  driver_id: number;
  partner_id: number;
  pickup_time?: string;
  delivery_time?: string;
  status: DeliveryStatus;
  pickup_photo_url?: string;
  delivery_photo_url?: string;
  issues?: string;
  created_at: string;
  updated_at: string;
  driver_name?: string;
  driver_phone?: string;
  partner_name?: string;
  partner_address?: string;
  partner_latitude?: number;
  partner_longitude?: number;
  partner_phone?: string;
  delivery_instructions?: string;
  food_quantity?: string;
  food_description?: string;
  photo_urls?: string[];
  event_title?: string;
  pickup_location?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
}

export interface Partner {
  id: number;
  organization_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  operating_hours?: string;
  food_preferences?: string;
  current_need_level: NeedLevel;
  delivery_instructions?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string;
  related_id?: number;
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_events?: number;
  scheduled_events?: number;
  assigned_events?: number;
  completed_events?: number;
  recoveries_with_food?: number;
  completed_deliveries?: number;
  active_reporters?: number;
  active_drivers?: number;
  active_partners?: number;
  total_reports?: number;
  reports_with_food?: number;
  total_deliveries?: number;
}
