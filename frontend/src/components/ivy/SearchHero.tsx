import { Search } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  ListingFilters,
  ListingFilterUpdate,
} from "@/types/property";

const options = [
  { label: "All", value: undefined },
  { label: "1 BHK", value: 1 },
  { label: "2 BHK", value: 2 },
  { label: "3 BHK", value: 3 },
  { label: "4+ BHK", value: 4 },
] as const;

export function SearchHero({
  filters,
  onChange,
}: {
  filters: ListingFilters;
  onChange: (value: ListingFilterUpdate) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isRentPage = location.pathname === "/rentals";

  return (
    <section className="border-b border-border bg-hero">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(460px,.8fr)]">
          <div>
            {/* Buy / Rent toggle */}
            <div className="mb-7 inline-flex rounded-md border border-primary/15 bg-background p-1">
              <Button
                size="sm"
                variant={!isRentPage ? "default" : "ghost"}
                className="shadow-none"
                onClick={() => navigate({ to: "/" })}
              >
                Buy
              </Button>

              <Button
                size="sm"
                variant={isRentPage ? "default" : "ghost"}
                className="shadow-none"
                onClick={() => navigate({ to: "/rentals" })}
              >
                Rent
              </Button>
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-foreground sm:text-6xl">
              {isRentPage
                ? "Find a home to rent."
                : "Find your next home."}
            </h1>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {isRentPage
                ? "Explore rental homes across Chennai."
                : "Explore verified properties across Chennai."}
            </p>
          </div>

          <div>
            <label htmlFor="property-search" className="sr-only">
              Search properties
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="property-search"
                value={filters.search ?? ""}
                onChange={(e) =>
                  onChange({
                    search: e.target.value || undefined,
                  })
                }
                placeholder="Search by property, locality or keyword..."
                className="h-14 bg-card pl-12 pr-4 text-base shadow-soft"
              />
            </div>

            <div
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Quick bedroom filters"
            >
              {options.map((item) => (
                <Button
                  key={item.label}
                  size="sm"
                  variant={
                    filters.bedroom === item.value
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    onChange({
                      bedroom: item.value,
                    })
                  }
                  className="rounded-full px-4 shadow-none"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}