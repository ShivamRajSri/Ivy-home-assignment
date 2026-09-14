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
import { rentalsService } from "@/services/rentals";
import { projectsService } from "@/services/projects";

import {
  authService,
  type AuthSession,
} from "@/services/auth";

import {
  loadSaved,
  toggleSaved,
} from "@/services/saved";

import type { Listing } from "@/types/property";
import type { Rental } from "@/types/rental";
import type { Project } from "@/types/project";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

type Tab =
  | "properties"
  | "rentals"
  | "projects";

function SavedPage() {
  const navigate = useNavigate();

  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [activeTab, setActiveTab] =
    useState<Tab>("properties");

  const [savedListings, setSavedListings] =
    useState<Listing[]>([]);

  const [savedRentals, setSavedRentals] =
    useState<Rental[]>([]);

  const [savedProjects, setSavedProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /*
   * Load all saved items for the
   * currently logged-in user.
   */
  const loadAllSaved = useCallback(
    async (currentSession: AuthSession) => {
      setLoading(true);
      setError(false);

      try {
        /*
         * Load saved IDs from localStorage.
         */
        const listingIds = Array.from(
          loadSaved(
            currentSession,
            "listing",
          ),
        );

        const rentalIds = Array.from(
          loadSaved(
            currentSession,
            "rental",
          ),
        );

        const projectIds = Array.from(
          loadSaved(
            currentSession,
            "project",
          ),
        );

        /*
         * Load actual records.
         */
        const [
          listingResults,
          rentalResults,
          projectResults,
        ] = await Promise.all([
          Promise.all(
            listingIds.map(async (id) => {
              try {
                return await listingsService.getListingById(
                  id,
                );
              } catch {
                return null;
              }
            }),
          ),

          Promise.all(
            rentalIds.map(async (id) => {
              try {
                return rentalsService.getRentalById(
                  id,
                );
              } catch {
                return null;
              }
            }),
          ),

          Promise.all(
            projectIds.map(async (id) => {
              try {
                return projectsService.getProjectById(
                  id,
                );
              } catch {
                return null;
              }
            }),
          ),
        ]);

        /*
         * Store valid records.
         */
        setSavedListings(
          listingResults.filter(
            (item): item is Listing =>
              item !== null,
          ),
        );

        setSavedRentals(
          rentalResults.filter(
            (item): item is Rental =>
              item !== null,
          ),
        );

        setSavedProjects(
          projectResults.filter(
            (item): item is Project =>
              item !== null,
          ),
        );

        setLoading(false);
      } catch (err) {
        console.error(
          "Failed to load saved items:",
          err,
        );

        setError(true);
        setLoading(false);
      }
    },
    [],
  );

  /*
   * Restore logged-in session.
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

      await loadAllSaved(currentSession);
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, [navigate, loadAllSaved]);

  /*
   * Remove saved property.
   */
  const removeListing = useCallback(
    (listingId: string) => {
      if (!session) {
        return;
      }

      toggleSaved(
        session,
        "listing",
        listingId,
      );

      setSavedListings((current) =>
        current.filter(
          (item) =>
            item.listing_id !== listingId,
        ),
      );
    },
    [session],
  );

  /*
   * Remove saved rental.
   */
  const removeRental = useCallback(
    (listingId: string) => {
      if (!session) {
        return;
      }

      toggleSaved(
        session,
        "rental",
        listingId,
      );

      setSavedRentals((current) =>
        current.filter(
          (item) =>
            item.listing_id !== listingId,
        ),
      );
    },
    [session],
  );

  /*
   * Remove saved project.
   */
  const removeProject = useCallback(
    (projectId: string) => {
      if (!session) {
        return;
      }

      toggleSaved(
        session,
        "project",
        projectId,
      );

      setSavedProjects((current) =>
        current.filter(
          (item) =>
            item.project_id !== projectId,
        ),
      );
    },
    [session],
  );

  /*
   * Open property detail page.
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
  const handleLogout = useCallback(
    async () => {
      await authService.signOut();

      navigate({
        to: "/",
      });
    },
    [navigate],
  );

  /*
   * Session is still loading.
   */
  if (!session) {
    return null;
  }

  const propertyCount =
    savedListings.length;

  const rentalCount =
    savedRentals.length;

  const projectCount =
    savedProjects.length;

  const totalSaved =
    propertyCount +
    rentalCount +
    projectCount;

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
            Saved
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {totalSaved === 0
              ? "Things you like will appear here."
              : `${totalSaved} ${
                  totalSaved === 1
                    ? "item"
                    : "items"
                } saved`}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() =>
              setActiveTab("properties")
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "properties"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Properties ({propertyCount})
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("rentals")
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "rentals"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Rentals ({rentalCount})
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("projects")
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "projects"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Projects ({projectCount})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[360px] animate-pulse rounded-xl border bg-card"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="font-medium">
              Unable to load saved items
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

        {/* =========================
            SAVED PROPERTIES
           ========================= */}
        {!loading &&
          !error &&
          activeTab === "properties" && (
            <>
              {savedListings.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {savedListings.map(
                    (listing) => (
                      <PropertyCard
                        key={
                          listing.listing_id
                        }
                        listing={listing}
                        favorite={true}
                        onFavorite={() =>
                          removeListing(
                            listing.listing_id,
                          )
                        }
                        onOpen={() =>
                          openListing(
                            listing.listing_id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No saved properties"
                  description="Browse properties and tap the heart icon to save your favorites."
                  buttonText="Browse Properties"
                  onBrowse={() =>
                    navigate({
                      to: "/",
                    })
                  }
                />
              )}
            </>
          )}

        {/* =========================
            SAVED RENTALS
           ========================= */}
        {!loading &&
          !error &&
          activeTab === "rentals" && (
            <>
              {savedRentals.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {savedRentals.map(
                    (rental) => (
                      <RentalSavedCard
                        key={
                          rental.listing_id
                        }
                        rental={rental}
                        onRemove={() =>
                          removeRental(
                            rental.listing_id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No saved rentals"
                  description="Browse rentals and tap the heart icon to save your favorite rental homes."
                  buttonText="Browse Rentals"
                  onBrowse={() =>
                    navigate({
                      to: "/rentals",
                    })
                  }
                />
              )}
            </>
          )}

        {/* =========================
            SAVED PROJECTS
           ========================= */}
        {!loading &&
          !error &&
          activeTab === "projects" && (
            <>
              {savedProjects.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {savedProjects.map(
                    (project) => (
                      <ProjectSavedCard
                        key={
                          project.project_id
                        }
                        project={project}
                        onRemove={() =>
                          removeProject(
                            project.project_id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No saved projects"
                  description="Browse projects and tap the heart icon to save your favorite projects."
                  buttonText="Browse Projects"
                  onBrowse={() =>
                    navigate({
                      to: "/projects",
                    })
                  }
                />
              )}
            </>
          )}
      </main>
    </div>
  );
}

/* =================================
   EMPTY STATE
   ================================= */

function EmptyState({
  title,
  description,
  buttonText,
  onBrowse,
}: {
  title: string;
  description: string;
  buttonText: string;
  onBrowse: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border bg-card px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <Heart className="size-7 text-muted-foreground" />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      <Button
        className="mt-6"
        onClick={onBrowse}
      >
        {buttonText}
      </Button>
    </div>
  );
}

/* =================================
   SAVED RENTAL CARD
   ================================= */

function RentalSavedCard({
  rental,
  onRemove,
}: {
  rental: Rental;
  onRemove: () => void;
}) {
  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-105"
        aria-label="Remove rental from saved"
      >
        <Heart className="size-5 fill-current text-red-500" />
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
              {rental.bathroom ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Carpet area
            </p>

            <p className="mt-1 font-medium">
              {rental.carpet_area != null
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

            <p className="mt-1 font-medium capitalize">
              {rental.furnishing ?? "—"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Posted by{" "}
          <span className="font-medium text-foreground">
            {rental.posted_by ?? "—"}
          </span>
        </p>
      </div>
    </article>
  );
}

/* =================================
   SAVED PROJECT CARD
   ================================= */

function ProjectSavedCard({
  project,
  onRemove,
}: {
  project: Project;
  onRemove: () => void;
}) {
  function formatPrice(
    value?: number,
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      return "Price on request";
    }

    /*
     * Keep the same representation
     * used on the Projects page.
     */
    if (value < 10) {
      return `₹${value.toFixed(2)} Cr`;
    }

    return `₹${value.toFixed(1)} L`;
  }

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-105"
        aria-label="Remove project from saved"
      >
        <Heart className="size-5 fill-current text-red-500" />
      </button>

      {/* Project placeholder */}
      <div className="flex h-44 items-center justify-center bg-muted">
        <Building2Icon />
      </div>

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Project
        </p>

        <h2 className="mt-2 pr-12 font-display text-xl font-semibold">
          {project.apartment_name}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {project.developer_name}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>
            {project.locality}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Price
            </p>

            <p className="mt-1 font-medium">
              {formatPrice(
                project.price_min,
              )}
              {" – "}
              {formatPrice(
                project.price_max,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Area
            </p>

            <p className="mt-1 font-medium">
              {project.min_area_sqft?.toLocaleString()}{" "}
              –{" "}
              {project.max_area_sqft?.toLocaleString()}{" "}
              sqft
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {project.total_listings ?? 0}{" "}
            listings
          </span>

          <span className="text-muted-foreground">
            {project.total_units?.toLocaleString() ??
              "—"}{" "}
            units
          </span>
        </div>

        {project.amenities &&
          project.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.amenities
                .slice(0, 4)
                .map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
            </div>
          )}
      </div>
    </article>
  );
}

/*
 * Small icon component so we don't need
 * another lucide import for the saved card.
 */
function Building2Icon() {
  return (
    <div className="text-muted-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    </div>
  );
}