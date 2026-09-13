import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Building2, Home, IndianRupee } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Header } from "@/components/ivy/Header";

import { authService, type AuthSession } from "@/services/auth";
import {
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "@/services/analytics";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Home;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 font-display text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function InsightsPage() {
  const navigate = useNavigate();

  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let active = true;

    authService
      .restoreSession()
      .then((storedSession) => {
        if (!active) return;

        if (!storedSession) {
          navigate({ to: "/" });
          return;
        }

        setSession(storedSession);
        setSummary(getAnalyticsSummary());
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleLogout() {
    authService.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading insights...
        </p>
      </div>
    );
  }

  if (!session || !summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        name={session.displayName}
        onLogout={handleLogout}
      />

      <main>
        <section className="border-b border-border bg-hero">
          <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Ivy Homes
            </p>

            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">
              Market insights.
            </h1>

            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A data-quality and market overview built from
              the assigned Chennai datasets and verified API
              behaviour.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total listing records"
              value={formatNumber(summary.totalListingRecords)}
              description="Records in the assigned listings dataset"
              icon={Home}
            />

            <StatCard
              title="Active listings"
              value={formatNumber(summary.activeListings)}
              description="Listings marked is_live = true"
              icon={BarChart3}
            />

            <StatCard
              title="Listings in last 7 days"
              value={formatNumber(summary.listingsLast7Days)}
              description="3 Sep – 10 Sep 2026"
              icon={Building2}
            />

            <StatCard
              title="Average 2 BHK price / sqft"
              value={formatCurrency(summary.avgPricePerSqft2BHK)}
              description="Live 2 BHK listings"
              icon={IndianRupee}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <IndianRupee className="size-5 text-primary" />

                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Rental overview
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Assigned locality: Adyar
                  </p>
                </div>
              </div>

              <p className="mt-6 font-display text-4xl font-semibold">
                {formatCurrency(summary.totalMonthlyRent)}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Combined monthly rent across the assigned
                Adyar rental records.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-primary" />

                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Costliest project
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Highest normalized price_max
                  </p>
                </div>
              </div>

              <p className="mt-6 font-display text-3xl font-semibold">
                {summary.costliestProject.apartmentName}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Project ID: {summary.costliestProject.projectId}
              </p>

              <p className="mt-4 text-xl font-semibold">
                {formatCurrency(
                  summary.costliestProject.priceMax,
                )}
              </p>
            </section>
          </div>

          <section className="mt-8 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-primary" />

              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Data quality findings
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Issues identified while validating the
                  assigned data.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Corrupt / impossible listings
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {summary.corruptListings}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Negative prices, impossible floors or
                  impossible area relationships.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Repeated token-payment listings
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {summary.fakeListings}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Listings containing the repeated
                  token-payment phrase.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Project listing-count mismatches
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {summary.projectsWithWrongListingCount}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Project totals differ from counted live
                  listings.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-primary" />

              <div>
                <h2 className="font-display text-2xl font-semibold">
                  API documentation check
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  The documented analytics endpoint was
                  tested against the assigned API host.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-border bg-muted p-4">
              <p className="font-mono text-sm">
                GET /v1/analytics/summary
              </p>

              <p className="mt-2 font-semibold">
                HTTP 404 — Not Found
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                The endpoint is unavailable on the assigned
                API host, so the dashboard calculates the
                verified metrics locally from the supplied
                datasets instead of inventing an API response.
              </p>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
});