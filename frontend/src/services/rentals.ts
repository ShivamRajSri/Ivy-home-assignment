import type { Rental } from "@/types/rental";
import rentalsData from "@/data/rentals.json";

const rentals = rentalsData as Rental[];

export interface RentalFilters {
  search?: string;
  locality?: string;
  bedroom?: number;
  furnishing?: string;
  min_price?: number;
  max_price?: number;
}

export interface RentalResponse {
  results: Rental[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export const rentalsService = {
  getRentals(
    filters: RentalFilters = {},
    offset = 0,
    limit = 9,
  ): RentalResponse {
    let rows = rentals.filter(
      (item) => item.is_live !== false,
    );

    if (filters.search?.trim()) {
      const term = filters.search
        .trim()
        .toLowerCase();

      rows = rows.filter((item) =>
        [
          item.title,
          item.apartment_name,
          item.locality,
          item.property_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }

    if (filters.locality) {
      rows = rows.filter(
        (item) => item.locality === filters.locality,
      );
    }

    if (filters.bedroom != null) {
      rows = rows.filter(
        (item) => item.bedroom === filters.bedroom,
      );
    }

    if (filters.furnishing) {
      rows = rows.filter(
        (item) => item.furnishing === filters.furnishing,
      );
    }

    if (filters.min_price != null) {
      rows = rows.filter(
        (item) => item.price >= filters.min_price!,
      );
    }

    if (filters.max_price != null) {
      rows = rows.filter(
        (item) => item.price <= filters.max_price!,
      );
    }

    const total = rows.length;

    return {
      results: rows.slice(
        offset,
        offset + limit,
      ),
      total,
      offset,
      limit,
      has_more: offset + limit < total,
    };
  },
  getRentalById(listingId: string): Rental | null {
  return (
    rentals.find(
      (rental) => rental.listing_id === listingId,
    ) ?? null
  );
},
};