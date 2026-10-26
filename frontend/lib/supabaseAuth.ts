import { supabase } from "./supabase";
import { Role, SupabaseUserProfile, AccountStatus } from "@/types";
import { setStoredToken, clearStoredToken } from "./auth";

export interface AuthResponse {
  success: boolean;
  profile?: SupabaseUserProfile;
  error?: string;
  sessionToken?: string;
}

/**
 * Normalizes input so Indian 10-digit mobile numbers or emails can both authenticate.
 */
export function normalizePhoneOrEmail(input: string): string {
  const trimmed = input.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length === 10 && !trimmed.includes("@")) {
    return `${digitsOnly}@phone.sathi.in`;
  }
  return trimmed.toLowerCase();
}

/**
 * Signs up a new user with Supabase Auth.
 * Enforces security rule: Users CANNOT self-register as ADMIN or SUPER_ADMIN.
 */
export async function signUpWithSupabase(
  phoneOrEmail: string,
  pass: string,
  fullName: string,
  role: Role,
  preferredLanguage: string = "en"
): Promise<AuthResponse> {
  try {
    // Security check: Block privileged self-assignment
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return {
        success: false,
        error: "Privileged administrator accounts cannot be registered publicly.",
      };
    }

    if (!pass || pass.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long.",
      };
    }

    const email = normalizePhoneOrEmail(phoneOrEmail);
    const isPhone = phoneOrEmail.trim().replace(/\D/g, "").length === 10;
    const phone = isPhone ? phoneOrEmail.trim().replace(/\D/g, "") : undefined;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName.trim() || "User",
          role,
          preferred_language: preferredLanguage,
          phone: phone || null,
        },
      },
    });

    if (authError) {
      // If already registered, suggest logging in
      if (authError.message.includes("User already registered")) {
        return {
          success: false,
          error: "An account with this email/phone already exists. Please log in.",
        };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user account." };
    }

    // If session is returned immediately (e.g. Email confirmation disabled)
    if (authData.session) {
      setStoredToken(authData.session.access_token);
    }

    // Retrieve created profile from profiles table
    const profile = await fetchProfileById(authData.user.id);

    return {
      success: true,
      profile: profile || {
        id: authData.user.id,
        fullName: fullName.trim(),
        role,
        accountStatus: "PENDING",
        preferredLanguage,
        phone: phone || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      sessionToken: authData.session?.access_token,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, error: msg };
  }
}

/**
 * Signs in user with email/mobile and password.
 * Checks account activation and suspension status.
 */
export async function signInWithSupabase(
  phoneOrEmail: string,
  pass: string
): Promise<AuthResponse> {
  try {
    if (!phoneOrEmail || !pass) {
      return { success: false, error: "Please enter your mobile/email and password." };
    }

    const email = normalizePhoneOrEmail(phoneOrEmail);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: "Unable to start session. Please try again." };
    }

    // Set token in session storage for compatibility
    setStoredToken(authData.session.access_token);

    // Fetch user profile from PostgreSQL
    const profile = await fetchProfileById(authData.user.id);

    if (profile) {
      if (!profile.isActive) {
        await supabase.auth.signOut();
        clearStoredToken();
        return {
          success: false,
          error: "Your account has been deactivated. Please contact support.",
        };
      }

      if (profile.accountStatus === "SUSPENDED") {
        await supabase.auth.signOut();
        clearStoredToken();
        return {
          success: false,
          error: "Your account is currently suspended. Please contact the administrator.",
        };
      }
    }

    return {
      success: true,
      profile: profile || {
        id: authData.user.id,
        fullName: authData.user.user_metadata?.full_name || "User",
        role: authData.user.user_metadata?.role || "FARMER",
        accountStatus: "PENDING",
        preferredLanguage: authData.user.user_metadata?.preferred_language || "en",
        isActive: true,
        createdAt: authData.user.created_at,
        updatedAt: authData.user.created_at,
      },
      sessionToken: authData.session.access_token,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sign in failed.";
    return { success: false, error: msg };
  }
}

/**
 * Signs out current user from Supabase and clears local storage.
 */
export async function signOutWithSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore signOut errors
  } finally {
    clearStoredToken();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("shetkari-sathi:supabase-profile");
    }
  }
}

/**
 * Fetches user profile from `public.profiles`.
 */
export async function fetchProfileById(userId: string): Promise<SupabaseUserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    const profile: SupabaseUserProfile = {
      id: data.id,
      fullName: data.full_name,
      role: data.role as Role,
      accountStatus: data.account_status as AccountStatus,
      preferredLanguage: data.preferred_language || "en",
      phone: data.phone,
      isActive: data.is_active,
      state: data.state,
      district: data.district,
      taluka: data.taluka,
      village: data.village,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("shetkari-sathi:supabase-profile", JSON.stringify(profile));
    }

    return profile;
  } catch {
    return null;
  }
}

/**
 * Fetches current authenticated session user and profile.
 */
export async function getCurrentProfile(): Promise<SupabaseUserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    return await fetchProfileById(user.id);
  } catch {
    return null;
  }
}

/**
 * Sends password reset email.
 */
export async function resetPasswordWithSupabase(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = normalizePhoneOrEmail(email);
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth?mode=reset` : undefined,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed.";
    return { success: false, error: msg };
  }
}
