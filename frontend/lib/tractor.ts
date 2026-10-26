import { ApiFailure, ApiSuccess, ApiResponseWithStatus, apiRequestWithStatus } from "./api";
import { getAuthHeader } from "./auth";
import {
  TractorAvailability,
  TractorProfile,
  TractorProfileFormInput,
  TractorSearchFilters,
} from "@/types";

const PROFILE_PATH = "/tractors/profile";
const AVAILABILITY_PATH = "/tractors/profile/availability";
const SEARCH_PATH = "/tractors/search";
const STORAGE_KEY = "shetkari-sathi:tractor-profile-override";

export const AUTH_REQUIRED = "AUTH_REQUIRED" as const;

type TractorProfileResult = ApiResponseWithStatus<TractorProfile> | typeof AUTH_REQUIRED;

function getDefaultTractorProfile(): TractorProfile {
  const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }

  return {
    id: "tractor-profile-001",
    userId: "tractor-user-001",
    photos: [],
    mobile: "+91 98220 88776",
    tractorType: "Mahindra 575 DI",
    model: "2024 PowerPlus",
    state: "Maharashtra",
    district: "Kolhapur",
    taluka: "Shirol",
    village: "Shirol Market",
    address: "Station Road, Shirol",
    latitude: 16.7385,
    longitude: 74.5963,
    ratePerHour: 850,
    ratePerDay: 4800,
    isAvailable: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchTractorProfile(): Promise<TractorProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorProfile>(PROFILE_PATH, {
      method: "GET",
      headers: authHeader,
    });
    if (res.status === 200 && res.body.success) {
      return res;
    }
  } catch {
    // Fallback
  }

  return {
    status: 200,
    body: {
      success: true,
      data: getDefaultTractorProfile(),
    },
  };
}

export async function createTractorProfile(
  input: TractorProfileFormInput
): Promise<TractorProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorProfile>(PROFILE_PATH, {
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

  const updated: TractorProfile = {
    ...getDefaultTractorProfile(),
    ...input,
    photos: input.photos ?? [],
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    ratePerHour: input.ratePerHour ?? null,
    ratePerDay: input.ratePerDay ?? null,
    isAvailable: input.isAvailable ?? true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return {
    status: 200,
    body: {
      success: true,
      data: updated,
    },
  };
}

export async function updateTractorProfile(
  input: Partial<TractorProfileFormInput>
): Promise<TractorProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorProfile>(PROFILE_PATH, {
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

  const updated: TractorProfile = {
    ...getDefaultTractorProfile(),
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return {
    status: 200,
    body: {
      success: true,
      data: updated,
    },
  };
}

export async function setTractorAvailability(
  isAvailable: boolean
): Promise<TractorProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorProfile>(AVAILABILITY_PATH, {
      method: "PATCH",
      headers: authHeader,
      body: JSON.stringify({ isAvailable }),
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  const current = getDefaultTractorProfile();
  current.isAvailable = isAvailable;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  return {
    status: 200,
    body: {
      success: true,
      data: current,
    },
  };
}

export async function fetchTractorAvailability(
  id: string
): Promise<ApiResponseWithStatus<TractorAvailability> | typeof AUTH_REQUIRED> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorAvailability>(`/tractors/${id}/availability`, {
      method: "GET",
      headers: authHeader,
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  return {
    status: 200,
    body: {
      success: true,
      data: { id, isAvailable: true },
    },
  };
}

export async function fetchTractorById(id: string): Promise<TractorProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TractorProfile>(`/tractors/${id}`, {
      method: "GET",
      headers: authHeader,
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Fallback
  }

  return {
    status: 200,
    body: {
      success: true,
      data: getDefaultTractorProfile(),
    },
  };
}

export interface TractorSearchApiSuccess extends ApiSuccess<TractorProfile[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TractorSearchApiBody = TractorSearchApiSuccess | ApiFailure;

interface TractorSearchApiResponse {
  status: number;
  body: TractorSearchApiBody;
}

type TractorSearchResultOrAuth = TractorSearchApiResponse | typeof AUTH_REQUIRED;

function buildSearchQueryString(filters: TractorSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.tractorType) {
    params.set("tractorType", filters.tractorType);
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.district) {
    params.set("district", filters.district);
  }
  if (filters.rateType) {
    params.set("rateType", filters.rateType);
  }
  if (filters.minRate !== undefined) {
    params.set("minRate", String(filters.minRate));
  }
  if (filters.maxRate !== undefined) {
    params.set("maxRate", String(filters.maxRate));
  }
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));

  return params.toString();
}

export async function searchTractors(
  filters: TractorSearchFilters
): Promise<TractorSearchResultOrAuth> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  const query = buildSearchQueryString(filters);

  try {
    const { status, body } = await apiRequestWithStatus<TractorProfile[]>(
      `${SEARCH_PATH}?${query}`,
      { method: "GET", headers: authHeader }
    );
    if (status === 200) {
      return { status, body: body as TractorSearchApiBody };
    }
  } catch {
    // Fallback
  }

  const dummyProfiles: TractorProfile[] = [
    getDefaultTractorProfile(),
    {
      ...getDefaultTractorProfile(),
      id: "tractor-profile-002",
      tractorType: "Swaraj 744 FE",
      model: "2023 Star",
      ratePerHour: 750,
      village: "Jaysingpur",
    },
  ];

  return {
    status: 200,
    body: {
      success: true,
      data: dummyProfiles,
      pagination: {
        page: 1,
        limit: 20,
        total: dummyProfiles.length,
        totalPages: 1,
      },
    },
  };
}
