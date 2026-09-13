import type {
  Listing,
  ListingParams,
  ListingResponse,
} from "@/types/property";
import { authService } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const FETCH_PAGE_SIZE = 100;

export interface ListingsService {
  getListings(params: ListingParams): Promise<ListingResponse>;
  getListingById(listingId: string): Promise<Listing | null>;
}

function buildQuery(params: ListingParams) {
  const query = new URLSearchParams();

  query.set("offset", String(params.offset));
  query.set("limit", String(params.limit));

  return query.toString();
}

async function requestListings(
  params: ListingParams,
  retry = true,
): Promise<ListingResponse> {
  const session = await authService.restoreSession();

  if (!session) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/listings?${buildQuery(params)}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    },
  );

  if (response.status === 401 && retry) {
    const refreshed = await authService.refreshSession();

    if (!refreshed) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    return requestListings(params, false);
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
    results: data.results ?? [],
    total: data.total ?? 0,
    offset: data.offset ?? params.offset,
    limit: data.limit ?? params.limit,
    has_more: Boolean(data.has_more),
  };
}

async function getListingById(
  listingId: string,
): Promise<Listing | null> {
  let offset = 0;

  while (true) {
    const response = await requestListings({
      offset,
      limit: FETCH_PAGE_SIZE,
    });

    const found = response.results.find(
      (listing) => listing.listing_id === listingId,
    );

    if (found) {
      return found;
    }

    if (
      !response.has_more ||
      response.results.length === 0
    ) {
      return null;
    }

    offset += response.results.length;
  }
}

export const listingsService: ListingsService = {
  async getListings(params) {
    return requestListings(params);
  },

  async getListingById(listingId) {
    return getListingById(listingId);
  },
};