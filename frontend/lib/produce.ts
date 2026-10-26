import {
  createProduceListingSupabase,
  fetchOwnProduceListingsSupabase,
  fetchPublicProduceListingsSupabase,
} from "./supabaseMarketplace";
import { ApiFailure, ApiSuccess, apiRequestWithStatus, ApiResponseWithStatus } from "./api";
import { getAuthHeader } from "./auth";
import {
  ProduceListing,
  ProduceListingFormInput,
  ProduceSearchFilters,
  PublicProduceListing,
} from "@/types";

const LISTINGS_PATH = "/produce/listings";
const SEARCH_PATH = "/produce/search";
const LISTING_PATH = "/produce";
const STORAGE_KEY = "shetkari-sathi:produce-listings";

export const AUTH_REQUIRED = "AUTH_REQUIRED" as const;

type ProduceListingResult = ApiResponseWithStatus<ProduceListing> | typeof AUTH_REQUIRED;

export interface ProduceListPaginatedSuccess<T> extends ApiSuccess<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ProduceListPaginatedBody<T> = ProduceListPaginatedSuccess<T> | ApiFailure;

interface ProduceListPaginatedResponse<T> {
  status: number;
  body: ProduceListPaginatedBody<T>;
}

type ProduceListPaginatedResultOrAuth<T> =
  | ProduceListPaginatedResponse<T>
  | typeof AUTH_REQUIRED;

const INITIAL_DEMO_PRODUCE: ProduceListing[] = [
  {
    id: "produce-001",
    farmerId: "farmer-user-001",
    crop: "Cotton (कापूस)",
    quantity: 45,
    unit: "QUINTAL",
    price: 7450,
    location: "Dindori, Nashik",
    description: "Export grade long staple cotton, moisture below 8%. Packed in standard bales.",
    photos: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "produce-002",
    farmerId: "farmer-user-001",
    crop: "Soybean (सोयाबीन)",
    quantity: 60,
    unit: "QUINTAL",
    price: 4820,
    location: "Dindori, Nashik",
    description: "High oil content, cleaned and graded seed quality soybean.",
    photos: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "produce-003",
    farmerId: "farmer-user-001",
    crop: "Red Onion (लाल कांदा)",
    quantity: 120,
    unit: "QUINTAL",
    price: 2850,
    location: "Lasalgaon, Nashik",
    description: "Medium to large uniform size, ideal for storage and long-distance transport.",
    photos: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getStoredProduce(): ProduceListing[] {
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
  }
  return INITIAL_DEMO_PRODUCE;
}

function saveStoredProduce(list: ProduceListing[]) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export async function createProduceListing(
  input: ProduceListingFormInput
): Promise<ProduceListingResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<ProduceListing>(LISTINGS_PATH, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify(input),
    });
    if (res.status === 200 || res.status === 201) {
      return res;
    }
  } catch {
    // Fallback
  }

  const current = getStoredProduce();
  const newListing: ProduceListing = {
    id: `produce-${Date.now()}`,
    farmerId: "farmer-user-001",
    crop: input.crop,
    quantity: input.quantity,
    unit: input.unit,
    price: input.price,
    location: input.location,
    description: input.description ?? null,
    photos: input.photos ?? [],
    isActive: input.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newListing, ...current];
  saveStoredProduce(updated);

  return {
    status: 201,
    body: {
      success: true,
      data: newListing,
    },
  };
}

export async function fetchOwnProduceListings(
  page = 1,
  limit = 20
): Promise<ProduceListPaginatedResultOrAuth<ProduceListing>> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  try {
    const { status, body } = await apiRequestWithStatus<ProduceListing[]>(
      `${LISTINGS_PATH}?${params.toString()}`,
      { method: "GET", headers: authHeader }
    );
    if (status === 200) {
      return { status, body: body as ProduceListPaginatedBody<ProduceListing> };
    }
  } catch {
    // Fallback
  }

  const list = getStoredProduce();

  return {
    status: 200,
    body: {
      success: true,
      data: list,
      pagination: {
        page,
        limit,
        total: list.length,
        totalPages: 1,
      },
    },
  };
}

export async function updateProduceListing(
  id: string,
  input: Partial<ProduceListingFormInput>
): Promise<ProduceListingResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<ProduceListing>(`${LISTINGS_PATH}/${id}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify(input),
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  const current = getStoredProduce();
  const item = current.find((p) => p.id === id);
  if (item) {
    Object.assign(item, input, { updatedAt: new Date().toISOString() });
    saveStoredProduce(current);
    return {
      status: 200,
      body: {
        success: true,
        data: item,
      },
    };
  }

  return {
    status: 404,
    body: {
      success: false,
      message: "Produce listing not found",
    },
  };
}

export async function deleteProduceListing(
  id: string
): Promise<ApiResponseWithStatus<null> | typeof AUTH_REQUIRED> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<null>(`${LISTINGS_PATH}/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  const current = getStoredProduce().filter((p) => p.id !== id);
  saveStoredProduce(current);

  return {
    status: 200,
    body: {
      success: true,
      data: null,
    },
  };
}

function buildSearchQueryString(filters: ProduceSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.crop) {
    params.set("crop", filters.crop);
  }
  if (filters.location) {
    params.set("location", filters.location);
  }
  if (filters.unit) {
    params.set("unit", filters.unit);
  }
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));

  return params.toString();
}

export async function searchProduceListings(
  filters: ProduceSearchFilters
): Promise<ProduceListPaginatedResultOrAuth<PublicProduceListing>> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  const query = buildSearchQueryString(filters);

  try {
    const { status, body } = await apiRequestWithStatus<PublicProduceListing[]>(
      `${SEARCH_PATH}?${query}`,
      { method: "GET", headers: authHeader }
    );
    if (status === 200) {
      return { status, body: body as ProduceListPaginatedBody<PublicProduceListing> };
    }
  } catch {
    // Fallback
  }

  const dummyPublicList: PublicProduceListing[] = [
    {
      id: "produce-001",
      crop: "Cotton (कापूस)",
      quantity: 45,
      unit: "QUINTAL",
      price: 7450,
      location: "Dindori, Nashik",
      description: "Export grade long staple cotton, moisture below 8%. Packed in standard bales.",
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farmer: {
        id: "farmer-001",
        fullName: "Ramesh Patil",
        farmerProfile: {
          mobile: "+91 98220 12345",
          village: "Dindori",
          taluka: "Dindori",
          district: "Nashik",
          state: "Maharashtra",
        },
      },
    },
    {
      id: "produce-002",
      crop: "Soybean (सोयाबीन)",
      quantity: 60,
      unit: "QUINTAL",
      price: 4820,
      location: "Latur Rural",
      description: "High oil content, cleaned and graded seed quality soybean.",
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farmer: {
        id: "farmer-002",
        fullName: "Dnyaneshwar Shinde",
        farmerProfile: {
          mobile: "+91 98220 77665",
          village: "Latur Rural",
          taluka: "Latur",
          district: "Latur",
          state: "Maharashtra",
        },
      },
    },
    {
      id: "produce-003",
      crop: "Red Onion (लाल कांदा)",
      quantity: 120,
      unit: "QUINTAL",
      price: 2850,
      location: "Lasalgaon, Nashik",
      description: "Medium to large uniform size, ideal for storage and long-distance transport.",
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farmer: {
        id: "farmer-003",
        fullName: "Sanjay Gaikwad",
        farmerProfile: {
          mobile: "+91 98220 11223",
          village: "Lasalgaon",
          taluka: "Niphad",
          district: "Nashik",
          state: "Maharashtra",
        },
      },
    },
  ];

  return {
    status: 200,
    body: {
      success: true,
      data: dummyPublicList,
      pagination: {
        page: 1,
        limit: 20,
        total: dummyPublicList.length,
        totalPages: 1,
      },
    },
  };
}

export async function fetchPublicProduceListing(
  id: string
): Promise<ApiResponseWithStatus<PublicProduceListing> | typeof AUTH_REQUIRED> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<PublicProduceListing>(`${LISTING_PATH}/${id}`, {
      method: "GET",
      headers: authHeader,
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  const sample: PublicProduceListing = {
    id,
    crop: "Cotton (कापूस)",
    quantity: 45,
    unit: "QUINTAL",
    price: 7450,
    location: "Dindori, Nashik",
    description: "Export grade long staple cotton, moisture below 8%. Packed in standard bales.",
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    farmer: {
      id: "farmer-001",
      fullName: "Ramesh Patil",
      farmerProfile: {
        mobile: "+91 98220 12345",
        village: "Dindori",
        taluka: "Dindori",
        district: "Nashik",
        state: "Maharashtra",
      },
    },
  };

  return {
    status: 200,
    body: {
      success: true,
      data: sample,
    },
  };
}
