import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Building2 } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Header } from "@/components/ivy/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  projectsService,
  type ProjectFilters,
} from "@/services/projects";

import type { Project } from "@/types/project";
import projectsData from "@/data/projects.json";
import { authService, type AuthSession } from "@/services/auth";

const projects = projectsData as Project[];

function formatPrice(value?: number) {
  if (value === undefined || value === null) {
    return "Price on request";
  }

  // Dataset uses small decimal values for crores
  // and larger values for lakhs.
  if (value < 10) {
    return `₹${value.toFixed(2)} Cr`;
  }

  return `₹${value.toFixed(1)} L`;
}

function ProjectCard({
  project,
}: {
  project: Project;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-44 items-center justify-center bg-muted">
        <Building2 className="size-12 text-muted-foreground" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {project.apartment_name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {project.developer_name}
            </p>
          </div>

          {project.project_status && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
              {project.project_status}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" />

          <span className="capitalize">
            {project.locality}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Price
            </p>

            <p className="mt-1 font-medium">
              {formatPrice(project.price_min)}
              {" – "}
              {formatPrice(project.price_max)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Area
            </p>

            <p className="mt-1 font-medium">
              {project.min_area_sqft?.toLocaleString()} –{" "}
              {project.max_area_sqft?.toLocaleString()} sqft
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {project.total_listings ?? 0} listings
          </span>

          <span className="text-muted-foreground">
            {project.total_units?.toLocaleString() ?? "—"} units
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

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [sessionLoading, setSessionLoading] =
    useState(true);

  const [filters, setFilters] =
    useState<ProjectFilters>({});

  const [offset, setOffset] = useState(0);

  const [data, setData] =
    useState<ReturnType<
      typeof projectsService.getProjects
    > | null>(null);

  const limit = 12;

  // Restore the real logged-in session.
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
      })
      .finally(() => {
        if (active) {
          setSessionLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    const result =
      projectsService.getProjects(
        filters,
        offset,
        limit,
      );

    setData(result);
  }, [filters, offset]);

  const localities = useMemo(() => {
    return Array.from(
      new Set(
        projects.map(
          (project) => project.locality,
        ),
      ),
    ).sort();
  }, []);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        projects
          .map(
            (project) =>
              project.project_status,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, []);

  function updateFilter(
    key: keyof ProjectFilters,
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));

    setOffset(0);
  }

  function clearFilters() {
    setFilters({});
    setOffset(0);
  }

  function handleLogout() {
    authService.signOut();
    navigate({ to: "/" });
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        name={session.displayName}
        onLogout={handleLogout}
      />

      <main>
        {/* Hero */}
        <section className="border-b border-border bg-hero">
          <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Ivy Homes
            </p>

            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">
              Explore projects.
            </h1>

            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Discover residential projects across
              Chennai with transparent pricing,
              areas, amenities and listing
              information.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-[1440px] flex-wrap gap-3 px-4 py-5 sm:px-6 lg:px-10">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={filters.search ?? ""}
                onChange={(event) =>
                  updateFilter(
                    "search",
                    event.target.value,
                  )
                }
                placeholder="Search projects, developers or localities..."
                className="pl-10"
              />
            </div>

            <select
              value={filters.locality ?? ""}
              onChange={(event) =>
                updateFilter(
                  "locality",
                  event.target.value,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">
                All localities
              </option>

              {localities.map((locality) => (
                <option
                  key={locality}
                  value={locality}
                >
                  {locality}
                </option>
              ))}
            </select>

            <select
              value={filters.status ?? ""}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value,
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">
                All statuses
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            {(filters.search ||
              filters.locality ||
              filters.status) && (
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </section>

        {/* Projects */}
        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Projects
              </p>

              <h2 className="mt-2 font-display text-3xl font-semibold">
                {data?.total ?? 0} projects
              </h2>
            </div>
          </div>

          {data?.results.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.results.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <h3 className="font-display text-xl font-semibold">
                No projects found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() =>
                  setOffset(
                    Math.max(
                      0,
                      offset - limit,
                    ),
                  )
                }
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page{" "}
                {Math.floor(offset / limit) + 1}
              </span>

              <Button
                variant="outline"
                disabled={!data.has_more}
                onClick={() =>
                  setOffset(
                    offset + limit,
                  )
                }
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});