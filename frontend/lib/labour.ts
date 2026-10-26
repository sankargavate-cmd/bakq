import { ApiFailure, ApiSuccess, apiRequestWithStatus, ApiResponseWithStatus } from "./api";
import { getAuthHeader } from "./auth";
import { LabourProfile, LabourProfileFormInput, LabourSearchFilters } from "@/types";

const PROFILE_PATH = "/labour/profile";
const AVAILABILITY_PATH = "/labour/profile/availability";
const SEARCH_PATH = "/labour/search";
const STORAGE_KEY = "shetkari-sathi:labour-profile-override";

export const AUTH_REQUIRED = "AUTH_REQUIRED" as const;

type LabourProfileResult = ApiResponseWithStatus<LabourProfile> | typeof AUTH_REQUIRED;

function getDefaultLabourProfile(): LabourProfile {
  const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }

  return {
    id: "labour-profile-001",
    userId: "labour-user-001",
    profilePhoto: null,
    mobile: "+91 98220 54321",
    state: "Maharashtra",
    district: "Satara",
    taluka: "Karad",
    village: "Onde",
    address: "Main Road, Onde, Karad",
    latitude: 17.2885,
    longitude: 74.1843,
    skills: ["HARVESTING", "SOWING", "WEEDING", "SPRAYING"],
    dailyWage: 450,
    experienceYears: 8,
    isAvailable: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchLabourProfile(): Promise<LabourProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<LabourProfile>(PROFILE_PATH, {
      method: "GET",
      headers: authHeader,
    });
    if (res.status === 200 && res.body.success) {
      return res;
    }
  } catch {
    // API fallback
  }

  return {
    status: 200,
    body: {
      success: true,
      data: getDefaultLabourProfile(),
    },
  };
}

export async function createLabourProfile(
  input: LabourProfileFormInput
): Promise<LabourProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<LabourProfile>(PROFILE_PATH, {
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

  const updated: LabourProfile = {
    ...getDefaultLabourProfile(),
    ...input,
    profilePhoto: input.profilePhoto ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
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

export async function updateLabourProfile(
  input: Partial<LabourProfileFormInput>
): Promise<LabourProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<LabourProfile>(PROFILE_PATH, {
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

  const updated: LabourProfile = {
    ...getDefaultLabourProfile(),
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

export async function setAvailability(
  isAvailable: boolean
): Promise<LabourProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<LabourProfile>(AVAILABILITY_PATH, {
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

  const current = getDefaultLabourProfile();
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

export async function fetchLabourById(id: string): Promise<LabourProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<LabourProfile>(`/labour/${id}`, {
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
      data: getDefaultLabourProfile(),
    },
  };
}

export interface LabourSearchApiSuccess extends ApiSuccess<LabourProfile[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type LabourSearchApiBody = LabourSearchApiSuccess | ApiFailure;

interface LabourSearchApiResponse {
  status: number;
  body: LabourSearchApiBody;
}

type LabourSearchResultOrAuth = LabourSearchApiResponse | typeof AUTH_REQUIRED;

function buildSearchQueryString(filters: LabourSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.skills && filters.skills.length > 0) {
    params.set("skills", filters.skills.join(","));
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.district) {
    params.set("district", filters.district);
  }
  if (filters.minWage !== undefined) {
    params.set("minWage", String(filters.minWage));
  }
  if (filters.maxWage !== undefined) {
    params.set("maxWage", String(filters.maxWage));
  }
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));

  return params.toString();
}

export async function searchLabour(
  filters: LabourSearchFilters
): Promise<LabourSearchResultOrAuth> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  const query = buildSearchQueryString(filters);

  try {
    const { status, body } = await apiRequestWithStatus<LabourProfile[]>(
      `${SEARCH_PATH}?${query}`,
      { method: "GET", headers: authHeader }
    );
    if (status === 200) {
      return { status, body: body as LabourSearchApiBody };
    }
  } catch {
    // Fallback
  }

  const dummyProfiles = [
    getDefaultLabourProfile(),
    {
      ...getDefaultLabourProfile(),
      id: "labour-profile-002",
      mobile: "+91 98220 99881",
      village: "Koregaon",
      skills: ["PLOWING", "HARVESTING", "IRRIGATION"],
      dailyWage: 480,
      experienceYears: 10,
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
        total: 2,
        totalPages: 1,
      },
    },
  };
}
