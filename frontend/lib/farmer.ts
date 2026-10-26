import { apiRequestWithStatus, ApiResponseWithStatus } from "./api";
import { getAuthHeader, getStoredRole } from "./auth";
import { getCurrentDemoPersona } from "./demoAccounts";
import { FarmerProfile, FarmerProfileFormInput } from "@/types";

const PROFILE_PATH = "/farmers/profile";
const STORAGE_KEY = "shetkari-sathi:farmer-profile-override";

export const AUTH_REQUIRED = "AUTH_REQUIRED" as const;

type FarmerProfileResult =
  | ApiResponseWithStatus<FarmerProfile>
  | typeof AUTH_REQUIRED;

function getDefaultFarmerProfile(): FarmerProfile {
  const demo = getCurrentDemoPersona();
  const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }

  return {
    id: "farmer-profile-001",
    userId: "farmer-user-001",
    profilePhoto: null,
    mobile: "+91 98220 12345",
    state: "Maharashtra",
    district: "Nashik",
    taluka: "Dindori",
    village: "Dindori Gram",
    address: "Gat No. 142/2, Near Water Canal, Dindori",
    latitude: 20.1983,
    longitude: 73.8347,
    farmingExperience: 14,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchFarmerProfile(): Promise<FarmerProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<FarmerProfile>(PROFILE_PATH, {
      method: "GET",
      headers: authHeader,
    });

    if (res.status === 200 && res.body.success) {
      return res;
    }
  } catch {
    // API not reachable, fallback to session profile
  }

  // Fallback for demo & Firebase users so farmer profile is always visible
  return {
    status: 200,
    body: {
      success: true,
      data: getDefaultFarmerProfile(),
    },
  };
}

export async function createFarmerProfile(
  input: FarmerProfileFormInput
): Promise<FarmerProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<FarmerProfile>(PROFILE_PATH, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify(input),
    });
    if (res.status === 200 || res.status === 201) {
      return res;
    }
  } catch {
    // Save to local session
  }

  const updated: FarmerProfile = {
    ...getDefaultFarmerProfile(),
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

export async function updateFarmerProfile(
  input: Partial<FarmerProfileFormInput>
): Promise<FarmerProfileResult> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return AUTH_REQUIRED;
  }

  try {
    const res = await apiRequestWithStatus<FarmerProfile>(PROFILE_PATH, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify(input),
    });
    if (res.status === 200) {
      return res;
    }
  } catch {
    // Save to local session
  }

  const updated: FarmerProfile = {
    ...getDefaultFarmerProfile(),
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
