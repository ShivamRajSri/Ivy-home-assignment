import { useCallback, useEffect, useState } from "react";
import { listingsService } from "@/services/listings";
import type {
  Listing,
  ListingFilters,
  ListingFilterUpdate,
  ListingResponse,
  ListingSort,
} from "@/types/property";

const initialFilters: ListingFilters = {};

const PAGE_SIZE = 100;

export function useListings(limit = 9) {
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [sort, setSort] = useState<ListingSort>("relevance");
  const [offset, setOffset] = useState(0);

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [data, setData] = useState<ListingResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /*
   * Load all listings from the real API.
   *
   * We intentionally use offset/limit because that is the actual
   * pagination shape observed from the Ivy Homes API.
   */
  useEffect(() => {
    let active = true;

    async function loadAllListings() {
      setIsLoading(true);
      setError(null);

      try {
        const collected: Listing[] = [];
        let currentOffset = 0;

        while (true) {
          const response = await listingsService.getListings({
            offset: currentOffset,
            limit: PAGE_SIZE,
          });

          collected.push(...response.results);

          /*
           * Do not rely only on response.total because the API's
           * reported total may not match the records available
           * through pagination.
           */
          if (!response.has_more || response.results.length === 0) {
            break;
          }

          currentOffset += response.results.length;
        }

        if (active) {
          setAllListings(collected);
        }
      } catch {
        if (active) {
          setError("We couldn't load the properties right now.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAllListings();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  /*
   * Apply filters and sorting locally.
   *
   * This makes the UI independent of whether the API supports
   * filtering parameters correctly.
   */
  useEffect(() => {
    if (isLoading) return;

    let rows = [...allListings];

    // Search
    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase();

      rows = rows.filter((item) =>
        [
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

    // Locality
    if (filters.locality) {
      rows = rows.filter(
        (item) => item.locality === filters.locality,
      );
    }

    // Bedroom
    if (filters.bedroom != null) {
      rows = rows.filter((item) => {
        if (filters.bedroom === 4) {
          return item.bedroom >= 4;
        }

        return item.bedroom === filters.bedroom;
      });
    }

    // Property type
    if (filters.property_type) {
      rows = rows.filter(
        (item) => item.property_type === filters.property_type,
      );
    }

    // Furnishing
    if (filters.furnishing) {
      rows = rows.filter(
        (item) => item.furnishing === filters.furnishing,
      );
    }

    // Minimum price
    if (filters.min_price != null) {
      rows = rows.filter(
        (item) => item.price >= filters.min_price!,
      );
    }

    // Maximum price
    if (filters.max_price != null) {
      rows = rows.filter(
        (item) => item.price <= filters.max_price!,
      );
    }

    // Verified
    if (filters.is_verified === true) {
      rows = rows.filter((item) => item.is_verified === true);
    }

    // Live
    if (filters.is_live === true) {
      rows = rows.filter((item) => item.is_live === true);
    }

    // Sorting
    if (sort === "price_asc") {
      rows.sort((a, b) => a.price - b.price);
    }

    if (sort === "price_desc") {
      rows.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      rows.sort(
        (a, b) =>
          Date.parse(b.posted_at ?? "") -
          Date.parse(a.posted_at ?? ""),
      );
    }

    const total = rows.length;

    // Pagination happens AFTER filtering.
    const results = rows.slice(offset, offset + limit);

    setData({
      results,
      total,
      offset,
      limit,
      has_more: offset + limit < total,
    });
  }, [
    allListings,
    filters,
    sort,
    offset,
    limit,
    isLoading,
  ]);

  /*
   * Update filters and always return to the first page.
   */
  const updateFilters = useCallback(
    (next: ListingFilterUpdate) => {
      setFilters((current) => {
        const merged = { ...current } as Record<
          string,
          unknown
        >;

        Object.entries(next).forEach(([key, value]) => {
          if (value === undefined) {
            delete merged[key];
          } else {
            merged[key] = value;
          }
        });

        return merged as ListingFilters;
      });

      setOffset(0);
    },
    [],
  );

  /*
   * Clear all filters.
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setOffset(0);
  }, []);

  /*
   * Retry the API request.
   */
  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  /*
   * If filters change and the current page becomes invalid,
   * return to page one.
   */
  useEffect(() => {
    setOffset(0);
  }, [filters, sort]);

  return {
    data,
    filters,
    updateFilters,
    clearFilters,

    sort,
    setSort,

    offset,
    setOffset,
    limit,

    isLoading,
    error,
    retry,
  };
}