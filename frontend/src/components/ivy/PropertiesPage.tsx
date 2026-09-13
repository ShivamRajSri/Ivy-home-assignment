import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Header } from "./Header";
import { SearchHero } from "./SearchHero";
import { FilterBar } from "./FilterBar";
import { PropertyCard } from "./PropertyCard";
import { OffsetPagination } from "./Pagination";
import {
  EmptyState,
  ErrorState,
  SkeletonGrid,
} from "./States";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useListings } from "@/hooks/useListings";

import type { AuthSession } from "@/services/auth";
import type { ListingSort } from "@/types/property";

interface PropertiesPageProps {
  session: AuthSession;
  onLogout: () => void;
}

/*
 * Create a separate localStorage key for each user.
 */
function getFavoritesKey(session: AuthSession) {
  return `ivy_saved_listings_${session.displayName}`;
}

/*
 * Load saved listing IDs from localStorage.
 */
function loadFavorites(key: string): Set<string> {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return new Set();
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.filter(
        (value): value is string =>
          typeof value === "string",
      ),
    );
  } catch {
    return new Set();
  }
}

export function PropertiesPage({
  session,
  onLogout,
}: PropertiesPageProps) {
  const navigate = useNavigate();

  const listings = useListings(9);

  /*
   * Saved listings.
   */
  const [favorites, setFavorites] = useState<Set<string>>(
    () => loadFavorites(getFavoritesKey(session)),
  );

  /*
   * Restore the correct saved listings when the user changes.
   */
  useEffect(() => {
    const key = getFavoritesKey(session);

    setFavorites(loadFavorites(key));
  }, [session]);

  /*
   * Persist saved listings whenever they change.
   */
  useEffect(() => {
    const key = getFavoritesKey(session);

    localStorage.setItem(
      key,
      JSON.stringify(Array.from(favorites)),
    );
  }, [favorites, session]);

  /*
   * Add/remove a listing from saved listings.
   */
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  /*
   * Open a real listing URL.
   *
   * Example:
   * /listings/MAG-4000145
   */
  const openListing = useCallback(
    (listingId: string) => {
      navigate({
        to: "/listings/$listingId",
        params: {
          listingId,
        },
      });
    },
    [navigate],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        name={session.displayName}
        onLogout={onLogout}
      />

      {/* Search */}
      <SearchHero
        filters={listings.filters}
        onChange={listings.updateFilters}
      />

      {/* Filters */}
      <FilterBar
        filters={listings.filters}
        onChange={listings.updateFilters}
        onClear={listings.clearFilters}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {/* Page header */}
        <div className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
              Curated for you
            </p>

            <h2 className="mt-2 font-display text-lg font-semibold sm:text-3xl">
              Properties in Chennai
            </h2>

            {listings.data && (
              <p className="mt-1 text-sm text-muted-foreground">
                {listings.data.total} homes match your search
              </p>
            )}

            <p className="mt-1 text-xs text-muted-foreground">
              {favorites.size} saved{" "}
              {favorites.size === 1
                ? "listing"
                : "listings"}
            </p>
          </div>

          {/* Sorting */}
          <Select
            value={listings.sort}
            onValueChange={(value) => {
              listings.setSort(value as ListingSort);
              listings.setOffset(0);
            }}
          >
            <SelectTrigger
              className="w-[140px] bg-card sm:w-[190px]"
              aria-label="Sort properties"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="relevance">
                Relevance
              </SelectItem>

              <SelectItem value="price_asc">
                Price: Low to High
              </SelectItem>

              <SelectItem value="price_desc">
                Price: High to Low
              </SelectItem>

              <SelectItem value="newest">
                Newest
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {listings.isLoading && <SkeletonGrid />}

        {/* Error */}
        {!listings.isLoading && listings.error && (
          <ErrorState onRetry={listings.retry} />
        )}

        {/* Empty state */}
        {!listings.isLoading &&
          !listings.error &&
          !listings.data?.results.length && (
            <EmptyState
              onClear={listings.clearFilters}
            />
          )}

        {/* Listings */}
        {!listings.isLoading &&
          !listings.error &&
          listings.data?.results.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.data.results.map((item) => (
                <PropertyCard
                  key={item.listing_id}
                  listing={item}
                  favorite={favorites.has(
                    item.listing_id,
                  )}
                  onFavorite={() =>
                    toggleFavorite(item.listing_id)
                  }
                  onOpen={() =>
                    openListing(item.listing_id)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            <OffsetPagination
              offset={listings.offset}
              limit={listings.limit}
              total={listings.data.total}
              hasMore={listings.data.has_more}
              loading={listings.isLoading}
              onOffsetChange={listings.setOffset}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}