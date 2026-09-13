import { useCallback, useEffect, useState } from "react";
import { listingsService } from "@/services/listings";
import type { ListingFilters, ListingFilterUpdate, ListingResponse, ListingSort } from "@/types/property";

const initialFilters: ListingFilters = {};
export function useListings(limit = 9) {
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [sort, setSort] = useState<ListingSort>("relevance");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ListingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true); setError(null);
    listingsService.getListings({ ...filters, sort, offset, limit })
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setError("We couldn't load the properties right now."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [filters, sort, offset, limit, reloadKey]);

  const updateFilters = useCallback((next: ListingFilterUpdate) => {
    setFilters((current) => {
      const merged = { ...current } as Record<string, unknown>;
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined) delete merged[key];
        else merged[key] = value;
      });
      return merged as ListingFilters;
    });
    setOffset(0);
  }, []);
  const clearFilters = useCallback(() => { setFilters(initialFilters); setOffset(0); }, []);
  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  return { data, filters, updateFilters, clearFilters, sort, setSort, offset, setOffset, limit, isLoading, error, retry };
}
