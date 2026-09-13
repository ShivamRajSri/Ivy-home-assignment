export interface Listing {
  listing_id: string;
  listing_url?: string;
  website?: string;
  city_id: number;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom?: number;
  balcony?: number;
  floor?: number;
  total_floors?: number;
  furnishing?: string;
  facing_direction?: string;
  covered_parking?: number;
  price: number;
  carpet_area?: number;
  super_built_up_area?: number;
  latitude?: number;
  longitude?: number;
  posted_by?: string;
  posted_by_name?: string;
  posted_by_contact?: string;
  project_id?: string | null;
  is_verified?: boolean;
  description?: string;
  posted_at?: string;
  is_live?: boolean;
  image?: string;
}

export interface ListingParams {
  offset: number;
  limit: number;
  search?: string;
  locality?: string;
  bedroom?: number;
  property_type?: string;
  furnishing?: string;
  min_price?: number;
  max_price?: number;
  is_verified?: boolean;
  is_live?: boolean;
  sort?: ListingSort;
}

export interface ListingResponse {
  results: Listing[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export type ListingSort = "relevance" | "price_asc" | "price_desc" | "newest";
export type ListingFilters = Omit<ListingParams, "offset" | "limit" | "sort">;
export type ListingFilterUpdate = { [K in keyof ListingFilters]?: ListingFilters[K] | undefined };
