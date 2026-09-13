import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Header } from "@/components/ivy/Header";
import { PropertyDetail } from "@/components/ivy/PropertyDetail";
import { listingsService } from "@/services/listings";
import { authService, type AuthSession } from "@/services/auth";
import type { Listing } from "@/types/property";

export const Route = createFileRoute("/listings/$listingId")({
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(
    null,
  );

  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadListing() {
      try {
        setLoading(true);
        setError(null);

        const currentSession =
          await authService.restoreSession();

        if (!currentSession) {
          navigate({
            to: "/",
          });

          return;
        }

        if (active) {
          setSession(currentSession);
        }

        const result =
          await listingsService.getListingById(listingId);

        if (!active) return;

        if (!result) {
          setError("This listing could not be found.");
          return;
        }

        setListing(result);
      } catch (cause) {
        if (!active) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load this listing.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      active = false;
    };
  }, [listingId, navigate]);

  async function handleLogout() {
    await authService.signOut();

    navigate({
      to: "/",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Loading property…
          </p>
        </div>
      </div>
    );
  }

  if (error || !listing || !session) {
    return (
      <div className="min-h-screen bg-background">
        {session && (
          <Header
            name={session.displayName}
            onLogout={handleLogout}
          />
        )}

        <div className="mx-auto max-w-[700px] px-6 py-20 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Listing unavailable
          </h1>

          <p className="mt-3 text-muted-foreground">
            {error ?? "We couldn't find this property."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/",
              })
            }
            className="mt-6 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Back to properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        name={session.displayName}
        onLogout={handleLogout}
      />

      <PropertyDetail
        listing={listing}
        onBack={() =>
          navigate({
            to: "/",
          })
        }
      />
    </div>
  );
}