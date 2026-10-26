import { supabase } from "./supabase";
import { GOVT_SCHEMES } from "./schemesData";
import {
  DatabaseGovernmentScheme,
  Complaint,
  ComplaintCategory,
  AuditLog,
  AccountStatus,
} from "@/types";

export interface AdminResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// 1. GOVERNMENT SCHEMES MANAGEMENT
// ============================================================

export async function fetchGovernmentSchemesSupabase(): Promise<AdminResult<DatabaseGovernmentScheme[]>> {
  try {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const schemes: DatabaseGovernmentScheme[] = data.map((row) => ({
        id: row.id,
        shortCode: row.short_code,
        title: row.title,
        titleMr: row.title_mr,
        titleHi: row.title_hi,
        category: row.category,
        authority: row.authority,
        description: row.description,
        descriptionMr: row.description_mr,
        descriptionHi: row.description_hi,
        eligibility: row.eligibility || [],
        eligibilityMr: row.eligibility_mr || [],
        requiredDocs: (row.required_docs as Array<{ name: string; nameMr?: string; required: boolean }>) || [],
        maxBenefit: row.max_benefit,
        subsidyPercent: row.subsidy_percent,
        deadline: row.deadline,
        officialUrl: row.official_url,
        isActive: row.is_active,
        lastVerifiedAt: row.last_verified_at,
        verifiedByAdminId: row.verified_by_admin_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      return { success: true, data: schemes };
    }
  } catch {
    // Fall back to verified seed data
  }

  // Fallback to verified seed data from schemesData.ts
  const fallbackSchemes: DatabaseGovernmentScheme[] = GOVT_SCHEMES.map((s) => ({
    id: s.id,
    shortCode: s.shortCode,
    title: s.title,
    titleMr: s.titleMr,
    titleHi: s.titleHi,
    category: s.category,
    authority: s.authority,
    description: s.description,
    descriptionMr: s.descriptionMr,
    descriptionHi: s.descriptionHi,
    eligibility: s.eligibility,
    eligibilityMr: s.eligibilityMr,
    requiredDocs: s.requiredDocs.map((d) => ({ name: d.name, nameMr: d.nameMr, required: d.required })),
    maxBenefit: s.maxBenefit,
    subsidyPercent: s.subsidyPercent,
    deadline: s.deadline,
    officialUrl: "https://mahadbt.maharashtra.gov.in",
    isActive: true,
    lastVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return { success: true, data: fallbackSchemes };
}

export async function verifySchemeByAdmin(schemeId: string): Promise<AdminResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("government_schemes")
      .update({
        last_verified_at: now,
        verified_by_admin_id: user.id,
        updated_at: now,
      })
      .eq("id", schemeId);

    if (error) return { success: false, error: error.message };

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "scheme.verified",
      table_name: "government_schemes",
      record_id: schemeId,
      new_values: { verified_at: now, verified_by_admin_id: user.id },
    });

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to verify scheme.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 2. PROVIDER VERIFICATION QUEUES
// ============================================================

export interface PendingVerificationItem {
  profileId: string;
  userId: string;
  role: "FARMER" | "LABOUR" | "TRACTOR_OWNER" | "TRANSPORT_PROVIDER";
  name: string;
  mobile: string;
  location: string;
  details: string;
  submittedAt: string;
}

export async function fetchPendingVerifications(): Promise<AdminResult<PendingVerificationItem[]>> {
  try {
    const items: PendingVerificationItem[] = [];

    // 1. Pending Farmers
    const { data: farmers } = await supabase
      .from("farmer_profiles")
      .select("id, user_id, mobile, village, taluka, district, state, farming_experience_years, created_at, profiles(full_name)")
      .eq("verification_status", "PENDING")
      .order("created_at", { ascending: true });

    if (farmers) {
      farmers.forEach((f: any) => {
        items.push({
          profileId: f.id,
          userId: f.user_id,
          role: "FARMER",
          name: f.profiles?.full_name || "Farmer",
          mobile: f.mobile,
          location: `${f.village}, ${f.taluka}, ${f.district}`,
          details: `Experience: ${f.farming_experience_years} years. Land extract pending review.`,
          submittedAt: f.created_at,
        });
      });
    }

    // 2. Pending Labour
    const { data: labours } = await supabase
      .from("labour_profiles")
      .select("id, user_id, mobile, village, taluka, district, daily_wage, skills, created_at, profiles(full_name)")
      .eq("verification_status", "PENDING")
      .order("created_at", { ascending: true });

    if (labours) {
      labours.forEach((l: any) => {
        items.push({
          profileId: l.id,
          userId: l.user_id,
          role: "LABOUR",
          name: l.profiles?.full_name || "Labour Worker",
          mobile: l.mobile,
          location: `${l.village}, ${l.taluka}, ${l.district}`,
          details: `Skills: ${(l.skills || []).join(", ") || "General Labour"}. Daily Wage: ₹${l.daily_wage}`,
          submittedAt: l.created_at,
        });
      });
    }

    // 3. Pending Tractors
    const { data: tractors } = await supabase
      .from("tractor_profiles")
      .select("id, user_id, mobile, village, taluka, district, tractor_type, model, created_at, profiles(full_name)")
      .eq("verification_status", "PENDING")
      .order("created_at", { ascending: true });

    if (tractors) {
      tractors.forEach((t: any) => {
        items.push({
          profileId: t.id,
          userId: t.user_id,
          role: "TRACTOR_OWNER",
          name: t.profiles?.full_name || "Tractor Owner",
          mobile: t.mobile,
          location: `${t.village}, ${t.taluka}, ${t.district}`,
          details: `${t.tractor_type} - ${t.model}. RC copy submitted.`,
          submittedAt: t.created_at,
        });
      });
    }

    return { success: true, data: items };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch verification queue.";
    return { success: false, error: msg };
  }
}

export async function reviewProviderVerification(
  profileType: "FARMER" | "LABOUR" | "TRACTOR_OWNER" | "TRANSPORT_PROVIDER",
  profileId: string,
  userId: string,
  action: "APPROVE" | "REJECT",
  rejectionReason?: string
): Promise<AdminResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const tableName =
      profileType === "FARMER"
        ? "farmer_profiles"
        : profileType === "LABOUR"
        ? "labour_profiles"
        : profileType === "TRACTOR_OWNER"
        ? "tractor_profiles"
        : "transport_profiles";

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      verification_status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      is_verified: action === "APPROVE",
      verified_at: now,
      verified_by_admin_id: user.id,
      updated_at: now,
    };

    if (action === "REJECT") {
      updatePayload.rejection_reason = rejectionReason || "Documents could not be verified.";
    }

    const { error: profileError } = await supabase
      .from(tableName)
      .update(updatePayload)
      .eq("id", profileId);

    if (profileError) return { success: false, error: profileError.message };

    // Update parent account_status in profiles table
    if (action === "APPROVE") {
      await supabase
        .from("profiles")
        .update({ account_status: "APPROVED", updated_at: now })
        .eq("id", userId);
    }

    // Write audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: `${profileType.toLowerCase()}.verification.${action.toLowerCase()}`,
      table_name: tableName,
      record_id: profileId,
      new_values: updatePayload,
    });

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to review verification.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 3. ACCOUNT SUSPENSION & RESTORATION
// ============================================================

export async function updateUserAccountStatus(
  userId: string,
  newStatus: AccountStatus,
  reason?: string
): Promise<AdminResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({
        account_status: newStatus,
        is_active: newStatus !== "SUSPENDED" && newStatus !== "REJECTED",
        updated_at: now,
      })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: `account_status.${newStatus.toLowerCase()}`,
      table_name: "profiles",
      record_id: userId,
      new_values: { account_status: newStatus, reason: reason || null },
    });

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update account status.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 4. COMPLAINTS & DISPUTE RESOLUTION
// ============================================================

export interface FileComplaintInput {
  category: ComplaintCategory;
  subject: string;
  description: string;
  respondentId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export async function fileComplaint(
  input: FileComplaintInput
): Promise<AdminResult<Complaint>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        complainant_id: user.id,
        respondent_id: input.respondentId || null,
        category: input.category,
        subject: input.subject.trim(),
        description: input.description.trim(),
        related_entity_type: input.relatedEntityType || null,
        related_entity_id: input.relatedEntityId || null,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const complaint: Complaint = {
      id: data.id,
      complainantId: data.complainant_id,
      respondentId: data.respondent_id,
      category: data.category,
      subject: data.subject,
      description: data.description,
      relatedEntityType: data.related_entity_type,
      relatedEntityId: data.related_entity_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, data: complaint };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit complaint.";
    return { success: false, error: msg };
  }
}

export async function fetchComplaints(asAdmin = false): Promise<AdminResult<Complaint[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    let query = supabase.from("complaints").select("*");

    if (!asAdmin) {
      query = query.or(`complainant_id.eq.${user.id},respondent_id.eq.${user.id}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };

    const list: Complaint[] = (data || []).map((row) => ({
      id: row.id,
      complainantId: row.complainant_id,
      respondentId: row.respondent_id,
      category: row.category,
      subject: row.subject,
      description: row.description,
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      status: row.status,
      resolutionNotes: row.resolution_notes,
      resolvedByAdminId: row.resolved_by_admin_id,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch complaints.";
    return { success: false, error: msg };
  }
}

export async function resolveComplaint(
  complaintId: string,
  action: "RESOLVED" | "DISMISSED",
  resolutionNotes: string
): Promise<AdminResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("complaints")
      .update({
        status: action,
        resolution_notes: resolutionNotes.trim(),
        resolved_by_admin_id: user.id,
        resolved_at: now,
        updated_at: now,
      })
      .eq("id", complaintId);

    if (error) return { success: false, error: error.message };

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: `complaint.${action.toLowerCase()}`,
      table_name: "complaints",
      record_id: complaintId,
      new_values: { status: action, resolution_notes: resolutionNotes },
    });

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to resolve complaint.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 5. SYSTEM AUDIT LOGS
// ============================================================

export async function fetchAuditLogs(limit = 50): Promise<AdminResult<AuditLog[]>> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    const logs: AuditLog[] = (data || []).map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      action: row.action,
      tableName: row.table_name,
      recordId: row.record_id,
      oldValues: row.old_values,
      newValues: row.new_values,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    }));

    return { success: true, data: logs };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch audit logs.";
    return { success: false, error: msg };
  }
}
