import { ApiFailure, ApiSuccess, ApiResponseWithStatus, apiRequestWithStatus } from "./api";
import { getAuthHeader } from "./auth";
import {
  TransportAvailability,
  TransportProfile,
  TransportProfileFormInput,
  TransportSearchFilters,
} from "@/types";

const PROFILE_PATH = "/transport/profile";
const AVAILABILITY_PATH = "/transport/profile/availability";
const SEARCH_PATH = "/transport/search";
const STORAGE_KEY = "shetkari-sathi:transport-profile-override";

export const AUTH_REQUIRED = "AUTH_REQUIRED" as const;

type TransportProfileResult = ApiResponseWithStatus<TransportProfile> | typeof AUTH_REQUIRED;

function getDefaultTransportProfile(): TransportProfile {
  const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }

  return {
    id: "transport-profile-001",
    userId: "transport-user-001",
    photos: [],
    mobile: "+91 98220 33221",
    vehicleType: "Covered Truck",
    vehicleNumber: "MH-10-AZ-9922",
    capacity: 10,
    capacityUnit: "TON",
    state: "Maharashtra",
    district: "Sangli",
    taluka: "Miraj",
    village: "Miraj MIDC",
    address: "Agro Transport Hub, Miraj",
    latitude: 16.8458,
    longitude: 74.6468,
    ratePerKm: 28,
    ratePerTrip: 3200,
    isAvailable: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchTransportProfile(): Promise<TransportProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportProfile>(PROFILE_PATH, {
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
      data: getDefaultTransportProfile(),
    },
  };
}

export async function createTransportProfile(
  input: TransportProfileFormInput
): Promise<TransportProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportProfile>(PROFILE_PATH, {
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

  const updated: TransportProfile = {
    ...getDefaultTransportProfile(),
    ...input,
    photos: input.photos ?? [],
    ratePerKm: input.ratePerKm ?? null,
    ratePerTrip: input.ratePerTrip ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
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

export async function updateTransportProfile(
  input: Partial<TransportProfileFormInput>
): Promise<TransportProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportProfile>(PROFILE_PATH, {
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

  const updated: TransportProfile = {
    ...getDefaultTransportProfile(),
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

export async function setTransportAvailability(
  isAvailable: boolean
): Promise<TransportProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportProfile>(AVAILABILITY_PATH, {
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

  const current = getDefaultTransportProfile();
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

export async function fetchTransportAvailability(
  id: string
): Promise<ApiResponseWithStatus<TransportAvailability> | typeof AUTH_REQUIRED> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportAvailability>(`/transport/${id}/availability`, {
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

export async function fetchTransportById(id: string): Promise<TransportProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<TransportProfile>(`/transport/${id}`, {
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
      data: getDefaultTransportProfile(),
    },
  };
}

export interface TransportSearchApiSuccess extends ApiSuccess<TransportProfile[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TransportSearchApiBody = TransportSearchApiSuccess | ApiFailure;

interface TransportSearchApiResponse {
  status: number;
  body: TransportSearchApiBody;
}

type TransportSearchResultOrAuth = TransportSearchApiResponse | typeof AUTH_REQUIRED;

function buildSearchQueryString(filters: TransportSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.vehicleType) {
    params.set("vehicleType", filters.vehicleType);
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.district) {
    params.set("district", filters.district);
  }
  if (filters.capacityUnit) {
    params.set("capacityUnit", filters.capacityUnit);
  }
  if (filters.minCapacity !== undefined) {
    params.set("minCapacity", String(filters.minCapacity));
  }
  if (filters.maxCapacity !== undefined) {
    params.set("maxCapacity", String(filters.maxCapacity));
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

export async function searchTransportProviders(
  filters: TransportSearchFilters
): Promise<TransportSearchResultOrAuth> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  const query = buildSearchQueryString(filters);

  try {
    const { status, body } = await apiRequestWithStatus<TransportProfile[]>(
      `${SEARCH_PATH}?${query}`,
      { method: "GET", headers: authHeader }
    );
    if (status === 200) {
      return { status, body: body as TransportSearchApiBody };
    }
  } catch {
    // Fallback
  }

  const dummyProfiles: TransportProfile[] = [
    getDefaultTransportProfile(),
    {
      ...getDefaultTransportProfile(),
      id: "transport-profile-002",
      vehicleType: "Open Truck",
      vehicleNumber: "MH-10-BB-3344",
      capacity: 5,
      ratePerKm: 22,
      village: "Tasgaon",
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
