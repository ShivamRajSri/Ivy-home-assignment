import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Compass,
  ExternalLink,
  MapPin,
  Ruler,
  Heart,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Listing } from "@/types/property";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

interface PropertyDetailProps {
  listing: Listing;
  favorite?: boolean;
  onFavorite?: () => void;
  onBack?: () => void;
}

export function PropertyDetail({
  listing,
  favorite = false,
  onFavorite,
  onBack,
}: PropertyDetailProps) {
  const facts = [
    [
      BedDouble,
      "Bedrooms",
      listing.bedroom != null
        ? `${listing.bedroom} BHK`
        : undefined,
    ],
    [
      Bath,
      "Bathrooms",
      listing.bathroom != null
        ? `${listing.bathroom}`
        : undefined,
    ],
    [
      Ruler,
      "Carpet area",
      listing.carpet_area != null
        ? `${listing.carpet_area.toLocaleString("en-IN")} sqft`
        : undefined,
    ],
    [
      Building2,
      "Super built-up",
      listing.super_built_up_area != null
        ? `${listing.super_built_up_area.toLocaleString("en-IN")} sqft`
        : undefined,
    ],
    [
      Building2,
      "Floor",
      listing.floor != null
        ? `${listing.floor} of ${listing.total_floors ?? "—"}`
        : undefined,
    ],
    [
      Compass,
      "Facing",
      listing.facing_direction,
    ],
    [
      Car,
      "Parking",
      listing.covered_parking != null
        ? `${listing.covered_parking} covered`
        : undefined,
    ],
  ] as const;

  return (
    <main className="min-h-screen bg-background">
      {/* Top navigation */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to properties
          </Button>

          {onFavorite && (
            <Button
              variant="outline"
              onClick={onFavorite}
              className="gap-2"
            >
              <Heart
                className={
                  favorite
                    ? "fill-primary text-primary"
                    : ""
                }
              />
              {favorite ? "Saved" : "Save listing"}
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-10">
        {/* Image */}
        <div className="relative aspect-[16/8] overflow-hidden rounded-xl bg-muted">
          {listing.image ? (
            <img
              src={listing.image}
              alt={`${listing.apartment_name} property`}
              width={1600}
              height={800}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Property image unavailable
            </div>
          )}

          <div className="absolute left-4 top-4 flex gap-2">
            {listing.is_live && (
              <span className="rounded-sm bg-live px-3 py-1.5 text-xs font-bold tracking-[.12em] text-live-foreground">
                LIVE
              </span>
            )}

            {listing.is_verified && (
              <span className="rounded-sm bg-card/95 px-3 py-1.5 text-xs font-bold text-primary">
                ✓ VERIFIED
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
              {listing.property_type}
            </p>

            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
              {listing.apartment_name}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {listing.locality}, Chennai
            </p>

            <p className="mt-6 font-display text-4xl font-semibold">
              {money(listing.price)}
            </p>

            {/* Facts */}
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
              {facts
                .filter((item) => item[2] != null)
                .map(([Icon, label, value]) => (
                  <div
                    key={label}
                    className="bg-card p-5"
                  >
                    <Icon className="size-5 text-primary" />

                    <p className="mt-3 text-xs text-muted-foreground">
                      {label}
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {value}
                    </p>
                  </div>
                ))}
            </div>

            {/* Description */}
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">
                About this home
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {listing.description ||
                  "Property details will be available soon."}
              </p>
            </div>

            {/* Additional information */}
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">
                Property information
              </h2>

              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Furnishing
                  </dt>
                  <dd className="mt-1 font-medium">
                    {listing.furnishing ?? "Not specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Posted by
                  </dt>
                  <dd className="mt-1 font-medium">
                    {listing.posted_by_name ??
                      listing.posted_by ??
                      "Not specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Listing ID
                  </dt>
                  <dd className="mt-1 font-medium">
                    {listing.listing_id}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Source
                  </dt>
                  <dd className="mt-1 flex items-center gap-1 font-medium">
                    {listing.website ?? "Not specified"}

                    {listing.website && (
                      <ExternalLink className="size-3" />
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Contact card */}
          <aside>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">
                Listed at
              </p>

              <p className="mt-1 font-display text-2xl font-semibold">
                {money(listing.price)}
              </p>

              <div className="my-6 h-px bg-border" />

              <p className="text-sm leading-6 text-muted-foreground">
                Interested in this property? Contact the seller
                using the details available through the listing
                source.
              </p>

              <Button
                className="mt-6 h-12 w-full"
                disabled
              >
                Contact Seller
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}