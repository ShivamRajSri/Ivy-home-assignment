import type {
  Listing,
  ListingParams,
  ListingResponse,
} from "@/types/property";
import { authService } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export interface ListingsService {
  getListings(params: ListingParams): Promise<ListingResponse>;

  getListingById(
    listingId: string,
  ): Promise<Listing | null>;
}

/*
 * Cache all listings in memory after the first successful load.
 * This lets us apply locality, bedroom, price, furnishing,
 * verified and live filters reliably on the client.
 */
let allListingsCache: Listing[] | null = null;

let loadingPromise: Promise<Listing[]> | null = null;

async function fetchListingPage(
  offset: number,
  limit: number,
  retry = true,
): Promise<ListingResponse> {
  const session = await authService.restoreSession();

  if (!session) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/listings?offset=${offset}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    },
  );

  /*
   * Access token expired.
   */
  if (response.status === 401 && retry) {
    const refreshed = await authService.refreshSession();

    if (!refreshed) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    return fetchListingPage(offset, limit, false);
  }

  if (!response.ok) {
    let message = "Unable to load listings.";

    try {
      const error = await response.json();

      if (error?.detail) {
        message = error.detail;
      } else if (error?.message) {
        message = error.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  const data = await response.json();

  return {
    results: Array.isArray(data.results)
      ? data.results
      : [],
    total: Number(data.total ?? 0),
    offset: Number(data.offset ?? offset),
    limit: Number(data.limit ?? limit),
    has_more: Boolean(data.has_more),
  };
}

/*
 * Download all listing records.
 *
 * We intentionally don't trust the API's `total` value because
 * the API has previously returned an inconsistent total.
 * We continue until has_more becomes false.
 */
async function fetchAllListings(): Promise<Listing[]> {
  if (allListingsCache) {
    return allListingsCache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const results: Listing[] = [];

    const pageSize = 100;
    let offset = 0;

    while (true) {
      const page = await fetchListingPage(
        offset,
        pageSize,
      );

      results.push(...page.results);

      if (
        !page.has_more ||
        page.results.length === 0
      ) {
        break;
      }

      offset += page.results.length;
    }

    allListingsCache = results;

    return results;
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/*
 * Case-insensitive text matching.
 */
function sameText(
  value: string | undefined,
  filter: string | undefined,
) {
  if (!filter) {
    return true;
  }

  return (
    value?.trim().toLowerCase() ===
    filter.trim().toLowerCase()
  );
}

/*
 * Apply all UI filters locally.
 */
function applyFilters(
  listings: Listing[],
  params: ListingParams,
) {
  const search = params.search
    ?.trim()
    .toLowerCase();

  return listings.filter((item) => {
    /*
     * Search
     */
    if (search) {
      const searchableText = [
        item.apartment_name,
        item.locality,
        item.property_type,
        item.description,
        item.posted_by,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    /*
     * Locality
     */
    if (!sameText(item.locality, params.locality)) {
      return false;
    }

    /*
     * Bedroom
     *
     * 4 means 4+ BHK.
     */
    if (params.bedroom != null) {
      if (params.bedroom === 4) {
        if (item.bedroom < 4) {
          return false;
        }
      } else if (item.bedroom !== params.bedroom) {
        return false;
      }
    }

    /*
     * Property type
     */
    if (
      !sameText(
        item.property_type,
        params.property_type,
      )
    ) {
      return false;
    }

    /*
     * Furnishing
     */
    if (
      !sameText(
        item.furnishing,
        params.furnishing,
      )
    ) {
      return false;
    }

    /*
     * Price
     */
    if (
      params.min_price != null &&
      item.price < params.min_price
    ) {
      return false;
    }

    if (
      params.max_price != null &&
      item.price > params.max_price
    ) {
      return false;
    }

    /*
     * Verified
     */
    if (
      params.is_verified === true &&
      item.is_verified !== true
    ) {
      return false;
    }

    /*
     * Live
     */
    if (
      params.is_live === true &&
      item.is_live !== true
    ) {
      return false;
    }

    return true;
  });
}

/*
 * Sorting
 */
function sortListings(
  listings: Listing[],
  sort: ListingParams["sort"],
) {
  const rows = [...listings];

  if (sort === "price_asc") {
    rows.sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    rows.sort((a, b) => b.price - a.price);
  }

  if (sort === "newest") {
    rows.sort(
      (a, b) =>
        Date.parse(b.posted_at ?? "") -
        Date.parse(a.posted_at ?? ""),
    );
  }

  return rows;
}

export const listingsService: ListingsService = {
  async getListings(params) {
    const allListings = await fetchAllListings();

    let filtered = applyFilters(
      allListings,
      params,
    );

    filtered = sortListings(
      filtered,
      params.sort,
    );

    const total = filtered.length;

    const results = filtered.slice(
      params.offset,
      params.offset + params.limit,
    );

    return {
      results,
      total,
      offset: params.offset,
      limit: params.limit,
      has_more:
        params.offset + params.limit < total,
    };
  },
  async getListingById(listingId) {
  const allListings = await fetchAllListings();

  return (
    allListings.find(
      (item) => item.listing_id === listingId,
    ) ?? null
   );
  },
};