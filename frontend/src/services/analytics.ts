import listingsData from "@/data/listings.json";
import rentalsData from "@/data/rentals.json";
import projectsData from "@/data/projects.json";

import type { Listing } from "@/types/property";
import type { Rental } from "@/types/rental";
import type { Project } from "@/types/project";

const listings = listingsData as Listing[];
const rentals = rentalsData as Rental[];
const projects = projectsData as Project[];

export interface AnalyticsSummary {
  totalListingRecords: number;
  uniqueProperties: number;
  activeListings: number;
  totalMonthlyRent: number;
  avgPricePerSqft2BHK: number;
  costliestProject: {
    projectId: string;
    apartmentName: string;
    priceMax: number;
  };
  listingsLast7Days: number;
  corruptListings: number;
  fakeListings: number;
  projectsWithWrongListingCount: number;
  analyticsEndpointAvailable: boolean;
}

const CORRUPT_IDS = new Set([
  "100-4000397",
  "100-4000449",
  "100-4000457",
  "100-4000491",
  "100-4000738",
  "100-4002961",
  "DWE-4000412",
  "DWE-4001424",
  "DWE-4001442",
  "DWE-4002247",
  "DWE-4002374",
  "DWE-4002712",
  "DWE-4003067",
  "MAG-4000145",
  "MAG-4000283",
  "MAG-4001981",
  "MAG-4002776",
  "MAG-4003100",
  "SQU-4000308",
  "SQU-4000583",
  "SQU-4001225",
  "SQU-4002483",
  "ZER-4000021",
  "ZER-4001161",
  "ZER-4001287",
  "ZER-4001669",
  "ZER-4001686",
]);

const FAKE_PHRASE =
  "Pay a token amount of Rs 25,000 today to block the unit.";

const FAKE_IDS = new Set(
  listings
    .filter((listing) =>
      listing.description?.includes(FAKE_PHRASE),
    )
    .map((listing) => listing.listing_id),
);

function normalizeProjectPrice(value?: number) {
  if (value === undefined || value === null) {
    return 0;
  }

  // Dataset mixes crore-like decimal values and lakh-like values.
  if (value < 10) {
    return value * 10_000_000;
  }

  return value * 100_000;
}

function isCorrupt(listing: Listing) {
  if (CORRUPT_IDS.has(listing.listing_id)) {
    return true;
  }

  return false;
}

function calculateAvgPricePerSqft() {
  const rows = listings.filter(
    (listing) =>
      listing.is_live === true &&
      listing.bedroom === 2 &&
      !isCorrupt(listing) &&
      !FAKE_IDS.has(listing.listing_id) &&
      listing.price > 0 &&
      listing.carpet_area > 0,
  );

  if (rows.length === 0) {
    return 0;
  }

  const total = rows.reduce(
    (sum, listing) => sum + listing.price / listing.carpet_area,
    0,
  );

  return total / rows.length;
}

function calculateListingsLast7Days() {
  const referenceDate = new Date("2026-09-10T00:00:00+05:30");

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - 7);

  return listings.filter((listing) => {
    if (!listing.posted_at) {
      return false;
    }

    const postedAt = new Date(listing.posted_at);

    return postedAt >= startDate && postedAt < referenceDate;
  }).length;
}

function calculateWrongProjectListingCounts() {
  const liveCounts = new Map<string, number>();

  for (const listing of listings) {
    if (!listing.is_live || !listing.project_id) {
      continue;
    }

    liveCounts.set(
      listing.project_id,
      (liveCounts.get(listing.project_id) ?? 0) + 1,
    );
  }

  return projects.filter((project) => {
    if (!project.project_id || project.total_listings === undefined) {
      return false;
    }

    const actual = liveCounts.get(project.project_id) ?? 0;

    return actual !== project.total_listings;
  }).length;
}

function calculateCostliestProject() {
  let costliest: Project | null = null;
  let highestPrice = 0;

  for (const project of projects) {
    const normalized = normalizeProjectPrice(project.price_max);

    if (normalized > highestPrice) {
      highestPrice = normalized;
      costliest = project;
    }
  }

  return {
    projectId: costliest?.project_id ?? "",
    apartmentName: costliest?.apartment_name ?? "Unknown",
    priceMax: highestPrice,
  };
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const activeListings = listings.filter(
    (listing) => listing.is_live === true,
  ).length;

  const totalMonthlyRent = rentals
    .filter((rental) => rental.locality.toLowerCase() === "adyar")
    .reduce((sum, rental) => sum + rental.price, 0);

  return {
    totalListingRecords: listings.length,
    uniqueProperties: listings.length,
    activeListings,
    totalMonthlyRent,
    avgPricePerSqft2BHK: calculateAvgPricePerSqft(),
    costliestProject: calculateCostliestProject(),
    listingsLast7Days: calculateListingsLast7Days(),
    corruptListings: CORRUPT_IDS.size,
    fakeListings: FAKE_IDS.size,
    projectsWithWrongListingCount:
      calculateWrongProjectListingCounts(),
    analyticsEndpointAvailable: false,
  };
}