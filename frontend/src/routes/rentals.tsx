import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

import { Header } from "@/components/ivy/Header";

import {
  authService,
  type AuthSession,
} from "@/services/auth";

import {
  rentalsService,
  type RentalFilters,
} from "@/services/rentals";

import {
  loadSaved,
  toggleSaved,
} from "@/services/saved";

export const Route = createFileRoute("/rentals")({
  component: RentalsPage,
});

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function RentalsPage() {
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [loadingSession, setLoadingSession] =
    useState(true);

  const [filters, setFilters] =
    useState<RentalFilters>({});

  const [offset, setOffset] =
    useState(0);

  /*
   * IDs of rentals saved by the current user.
   */
  const [savedRentals, setSavedRentals] =
    useState<Set<string>>(new Set());

  /*
   * Restore the actual logged-in session
   * and load this user's saved rentals.
   */
  useEffect(() => {
    let active = true;

    authService
      .restoreSession()
      .then((restored) => {
        if (!active) {
          return;
        }

        setSession(restored);

        if (restored) {
          setSavedRentals(
            loadSaved(restored, "rental"),
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(
    () =>
      rentalsService.getRentals(
        filters,
        offset,
        9,
      ),
    [filters, offset],
  );

  function updateFilter(
    key: keyof RentalFilters,
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      [key]:
        value === ""
          ? undefined
          : key === "bedroom"
            ? Number(value)
            : value,
    }));

    setOffset(0);
  }

  function clearFilters() {
    setFilters({});
    setOffset(0);
  }

  /*
   * Save / remove a rental from favorites.
   */
  function handleFavorite(
    listingId: string,
  ) {
    if (!session) {
      return;
    }

    setSavedRentals(
      toggleSaved(
        session,
        "rental",
        listingId,
      ),
    );
  }

  /*
   * Session loading.
   */
  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading rentals...
        </p>
      </div>
    );
  }

  /*
   * Not logged in.
   */
  if (!session) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        name={session.displayName}
        onLogout={async () => {
          await authService.signOut();

          window.location.href = "/";
        }}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
            Chennai rentals
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Find your next rental
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {data.total} rental homes available
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={filters.search ?? ""}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value,
              )
            }
            placeholder="Search rentals"
            className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <select
            value={filters.locality ?? ""}
            onChange={(event) =>
              updateFilter(
                "locality",
                event.target.value,
              )
            }
            className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">
              All localities
            </option>

            <option value="adyar">
              Adyar
            </option>

            <option value="omr">
              OMR
            </option>

            <option value="perungudi">
              Perungudi
            </option>

            <option value="thoraipakkam">
              Thoraipakkam
            </option>

            <option value="guindy">
              Guindy
            </option>

            <option value="tambaram">
              Tambaram
            </option>

            <option value="t nagar">
              T Nagar
            </option>

            <option value="anna nagar">
              Anna Nagar
            </option>

            <option value="porur">
              Porur
            </option>

            <option value="velachery">
              Velachery
            </option>
          </select>

          <select
            value={
              filters.bedroom?.toString() ?? ""
            }
            onChange={(event) =>
              updateFilter(
                "bedroom",
                event.target.value,
              )
            }
            className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">
              Any bedrooms
            </option>

            <option value="1">
              1 BHK
            </option>

            <option value="2">
              2 BHK
            </option>

            <option value="3">
              3 BHK
            </option>

            <option value="4">
              4 BHK
            </option>
          </select>

          <select
            value={filters.furnishing ?? ""}
            onChange={(event) =>
              updateFilter(
                "furnishing",
                event.target.value,
              )
            }
            className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">
              Any furnishing
            </option>

            <option value="unfurnished">
              Unfurnished
            </option>

            <option value="semi-furnished">
              Semi-furnished
            </option>

            <option value="fully-furnished">
              Fully-furnished
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary"
          >
            Clear filters
          </button>
        </div>

        {/* Results */}
        {data.results.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center">
            <h2 className="font-display text-2xl font-semibold">
              No rentals found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.results.map((rental) => {
                const isSaved =
                  savedRentals.has(
                    rental.listing_id,
                  );

                return (
                  <article
                    key={rental.listing_id}
                    className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card"
                  >
                    {/* Favorite button */}
                    <button
                      type="button"
                      onClick={() =>
                        handleFavorite(
                          rental.listing_id,
                        )
                      }
                      className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm transition hover:scale-105"
                      aria-label={
                        isSaved
                          ? "Remove rental from saved"
                          : "Save rental"
                      }
                    >
                      <Heart
                        className={`size-5 transition ${
                          isSaved
                            ? "fill-current text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>

                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {rental.property_type}
                      </p>

                      <h2 className="mt-2 pr-12 font-display text-xl font-semibold">
                        {rental.apartment_name}
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {rental.locality}, Chennai
                      </p>

                      <p className="mt-5 font-display text-2xl font-semibold">
                        {money(rental.price)}

                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          / month
                        </span>
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bedrooms
                          </p>

                          <p className="mt-1 font-medium">
                            {rental.bedroom} BHK
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bathrooms
                          </p>

                          <p className="mt-1 font-medium">
                            {rental.bathroom ??
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Carpet area
                          </p>

                          <p className="mt-1 font-medium">
                            {rental.carpet_area !=
                            null
                              ? `${rental.carpet_area.toLocaleString(
                                  "en-IN",
                                )} sqft`
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Furnishing
                          </p>

                          <p className="mt-1 font-medium">
                            {rental.furnishing ??
                              "—"}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Posted by{" "}
                        <span className="font-medium text-foreground">
                          {rental.posted_by ??
                            "—"}
                        </span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() =>
                  setOffset(
                    Math.max(
                      0,
                      offset - 9,
                    ),
                  )
                }
                className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-muted-foreground">
                Page{" "}
                {Math.floor(offset / 9) +
                  1}
              </span>

              <button
                type="button"
                disabled={!data.has_more}
                onClick={() =>
                  setOffset(offset + 9)
                }
                className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}