import { mockListings } from "@/data/mockListings";
import type { ListingParams, ListingResponse } from "@/types/property";

export interface ListingsService { getListings(params: ListingParams): Promise<ListingResponse>; }
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const mockListingsService: ListingsService = {
  async getListings(params) {
    await wait(450);
    const term = params.search?.trim().toLowerCase();
    let rows = mockListings.filter((item) =>
      (!term || `${item.apartment_name} ${item.locality} ${item.property_type}`.toLowerCase().includes(term)) &&
      (!params.locality || item.locality === params.locality) &&
      (!params.bedroom || (params.bedroom === 4 ? item.bedroom >= 4 : item.bedroom === params.bedroom)) &&
      (!params.property_type || item.property_type === params.property_type) &&
      (!params.furnishing || item.furnishing === params.furnishing) &&
      (params.min_price == null || item.price >= params.min_price) &&
      (params.max_price == null || item.price <= params.max_price) &&
      (params.is_verified !== true || item.is_verified === true) &&
      (params.is_live !== true || item.is_live === true),
    );
    if (params.sort === "price_asc") rows = [...rows].sort((a, b) => a.price - b.price);
    if (params.sort === "price_desc") rows = [...rows].sort((a, b) => b.price - a.price);
    if (params.sort === "newest") rows = [...rows].sort((a, b) => Date.parse(b.posted_at ?? "") - Date.parse(a.posted_at ?? ""));
    const total = rows.length;
    return { results: rows.slice(params.offset, params.offset + params.limit), total, offset: params.offset, limit: params.limit, has_more: params.offset + params.limit < total };
  },
};
export const listingsService: ListingsService = mockListingsService;
