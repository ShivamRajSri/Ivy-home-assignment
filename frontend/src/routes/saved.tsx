import { useCallback, useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { Header } from "@/components/ivy/Header";
import { PropertyCard } from "@/components/ivy/PropertyCard";
import { Button } from "@/components/ui/button";

import { listingsService } from "@/services/listings";
import {
  authService,
  type AuthSession,
} from "@/services/auth";

import type { Listing } from "@/types/property";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

/*
 * Create a separate localStorage key for each user.
 */
function getFavoritesKey(session: AuthSession) {
  return `ivy_saved_listings_${session.displayName}`;
}

/*
 * Load saved listing IDs.
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

function SavedPage() {
  const navigate = useNavigate();

  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [favorites, setFavorites] =
    useState<Set<string>>(new Set());

  const [savedListings, setSavedListings] =
    useState<Listing[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /*
   * Restore the logged-in session.
   */
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const currentSession =
        await authService.restoreSession();

      if (cancelled) {
        return;
      }

      if (!currentSession) {
        navigate({ to: "/" });
        return;
      }

      setSession(currentSession);

      const key = getFavoritesKey(currentSession);

      setFavorites(loadFavorites(key));
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
   * Load the actual listing records
   * corresponding to saved listing IDs.
   */
  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    async function loadSavedListings() {
      setLoading(true);
      setError(false);

      try {
        const ids = Array.from(favorites);

        if (ids.length === 0) {
          if (!cancelled) {
            setSavedListings([]);
            setLoading(false);
          }

          return;
        }

        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              return await listingsService.getListingById(
                id,
              );
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setSavedListings(
            results.filter(
              (listing): listing is Listing =>
                listing !== null,
            ),
          );

          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadSavedListings();

    return () => {
      cancelled = true;
    };
  }, [favorites, session]);

  /*
   * Remove a property from saved listings.
   */
  const removeFavorite = useCallback(
    (listingId: string) => {
      if (!session) {
        return;
      }

      setFavorites((current) => {
        const next = new Set(current);

        next.delete(listingId);

        localStorage.setItem(
          getFavoritesKey(session),
          JSON.stringify(Array.from(next)),
        );

        return next;
      });
    },
    [session],
  );

  /*
   * Open listing detail page.
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

  /*
   * Logout.
   */
  const handleLogout = useCallback(async () => {
    await authService.signOut();

    navigate({
      to: "/",
    });
  }, [navigate]);

  /*
   * Session is still being restored.
   */
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        name={session.displayName}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
            Your collection
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Saved Properties
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {favorites.size === 0
              ? "Properties you like will appear here."
              : `${favorites.size} ${
                  favorites.size === 1
                    ? "property"
                    : "properties"
                } saved`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-[360px] animate-pulse rounded-xl border bg-card"
                />
              ),
            )}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="font-medium">
              Unable to load saved properties
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Please try again.
            </p>

            <Button
              className="mt-5"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          favorites.size === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border bg-card px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
                <Heart className="size-7 text-muted-foreground" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No saved properties yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Browse properties and tap the heart
                icon to save your favorites.
              </p>

              <Button
                className="mt-6"
                onClick={() =>
                  navigate({ to: "/" })
                }
              >
                Browse Properties
              </Button>
            </div>
          )}

        {/* Saved properties */}
        {!loading &&
          !error &&
          savedListings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {savedListings.map((listing) => (
                <PropertyCard
                  key={listing.listing_id}
                  listing={listing}
                  favorite={true}
                  onFavorite={() =>
                    removeFavorite(
                      listing.listing_id,
                    )
                  }
                  onOpen={() =>
                    openListing(
                      listing.listing_id,
                    )
                  }
                />
              ))}
            </div>
          )}

        {/* Saved IDs exist but records couldn't be loaded */}
        {!loading &&
          !error &&
          favorites.size > 0 &&
          savedListings.length === 0 && (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="font-medium">
                Saved properties could not be found.
              </p>

              <Button
                className="mt-5"
                onClick={() =>
                  navigate({ to: "/" })
                }
              >
                Browse Properties
              </Button>
            </div>
          )}
      </main>
    </div>
  );
}