export interface Project {
  project_id: string;
  project_url?: string;
  city_id: number;
  apartment_name: string;
  developer_name?: string;
  locality: string;
  project_status?: string;
  total_units?: number;
  total_towers?: number;
  total_floors?: number;
  launch_date?: string;
  possession_date?: string;
  rera_number?: string;
  min_area_sqft?: number;
  max_area_sqft?: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  total_listings?: number;
  price_min?: number;
  price_max?: number;
}