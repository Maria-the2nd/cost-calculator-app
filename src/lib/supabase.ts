import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clolnikizfjkvhgjfxce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb2xuaWtpemZqa3ZoZ2pmeGNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjM5OTAyMywiZXhwIjoyMDU3OTc1MDIzfQ.IoXVC-W_HrXZxpMqk7HWS1rhlOfVNmqgsvXmX8w3RSo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database tables
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login?: string;
};

export type Client = {
  id: string;
  name: string;
  email?: string;
  contact_number?: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  client_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: string;
};

export type TechnicalVisit = {
  id: string;
  project_id: string;
  location_type: 'internal' | 'external';
  num_days: number;
  num_nights: number;
  num_people: number;
  daytime_hours: number;
  nighttime_hours: number;
  kilometers: number;
  has_accommodation: boolean;
  num_meals: number;
  external_service_cost: number;
  calculated_daytime_cost: number;
  calculated_nighttime_cost: number;
  calculated_km_cost: number;
  calculated_accommodation_cost: number;
  calculated_meals_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
};

export type Implementation = {
  id: string;
  project_id: string;
  location_type: 'internal' | 'external';
  num_days: number;
  num_nights: number;
  num_people: number;
  daytime_hours: number;
  nighttime_hours: number;
  kilometers: number;
  has_accommodation: boolean;
  num_meals: number;
  external_service_cost: number;
  calculated_daytime_cost: number;
  calculated_nighttime_cost: number;
  calculated_km_cost: number;
  calculated_accommodation_cost: number;
  calculated_meals_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
};

export type RateValue = {
  id: string;
  description: string;
  value: number;
  currency: string;
  effective_date: string;
  end_date?: string;
  is_current: boolean;
};
