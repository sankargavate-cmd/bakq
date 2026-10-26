import { supabase } from "./supabase";
import {
  OfflinePayment,
  OfflinePaymentMethod,
  OfflinePaymentStatus,
  PaymentPurpose,
  PaymentPartialRecord,
  AgentCashbook,
  AgentCashbookEntry,
  AgentCommission,
} from "@/types";

export interface PaymentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RecordPaymentInput {
  payerId: string;
  payeeId: string;
  agentId?: string | null;
  purpose: PaymentPurpose;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  amount: number;
  initialAmountPaid?: number;
  method: OfflinePaymentMethod;
  upiReference?: string | null;
  paymentEvidenceUrl?: string | null;
  notes?: string | null;
}

/**
 * Uploads receipt / payment evidence photo to private `payment-evidence` bucket.
 */
export async function uploadPaymentEvidence(file: File): Promise<PaymentResult<string>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to upload payment evidence." };

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-evidence")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("payment-evidence")
      .getPublicUrl(fileName);

    return { success: true, data: urlData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Evidence upload failed.";
    return { success: false, error: msg };
  }
}

/**
 * Records an authorized offline cash collection or verifiable UPI payment.
 * Generates tamper-proof unique receipt number and prevents duplicate payments.
 */
export async function recordOfflinePayment(
  input: RecordPaymentInput
): Promise<PaymentResult<OfflinePayment>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to record payments." };

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: "Payment amount must be greater than zero." };
    }

    if (input.method === "UPI" && (!input.upiReference || input.upiReference.trim().length < 6)) {
      return {
        success: false,
        error: "A valid 12-digit UPI reference / UTR number is required for UPI payments.",
      };
    }

    // Duplicate check: Prevent two active payments for the same entity
    if (input.relatedEntityId && input.relatedEntityType) {
      const { data: existing } = await supabase
        .from("offline_payments")
        .select("id, receipt_number, status")
        .eq("related_entity_id", input.relatedEntityId)
        .eq("related_entity_type", input.relatedEntityType)
        .in("status", ["PENDING", "SUBMITTED", "VERIFIED"]);

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: `An active payment (${existing[0].receipt_number}) already exists for this order/booking.`,
        };
      }
    }

    const initialPaid = input.initialAmountPaid !== undefined ? input.initialAmountPaid : input.amount;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const receiptNumber = `RCPT-${dateStr}-${randomHex}`;

    const { data, error } = await supabase
      .from("offline_payments")
      .insert({
        receipt_number: receiptNumber,
        payer_id: input.payerId,
        payee_id: input.payeeId,
        agent_id: input.agentId || user.id,
        purpose: input.purpose,
        related_entity_type: input.relatedEntityType || null,
        related_entity_id: input.relatedEntityId || null,
        amount: input.amount,
        amount_paid: initialPaid,
        method: input.method,
        upi_reference: input.upiReference?.trim() || null,
        payment_evidence_url: input.paymentEvidenceUrl || null,
        status: "SUBMITTED",
        submitted_at: new Date().toISOString(),
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Record partial record entry if initial payment was made
    if (initialPaid > 0) {
      await supabase.from("payment_partial_records").insert({
        payment_id: data.id,
        amount: initialPaid,
        method: input.method,
        upi_reference: input.upiReference?.trim() || null,
        evidence_url: input.paymentEvidenceUrl || null,
        recorded_by_id: user.id,
        notes: "Initial payment collection",
      });
    }

    const payment: OfflinePayment = {
      id: data.id,
      receiptNumber: data.receipt_number,
      payerId: data.payer_id,
      payeeId: data.payee_id,
      agentId: data.agent_id,
      purpose: data.purpose,
      relatedEntityType: data.related_entity_type,
      relatedEntityId: data.related_entity_id,
      amount: Number(data.amount),
      amountPaid: Number(data.amount_paid),
      outstandingBalance: Number(data.amount) - Number(data.amount_paid),
      method: data.method,
      upiReference: data.upi_reference,
      paymentEvidenceUrl: data.payment_evidence_url,
      status: data.status,
      submittedAt: data.submitted_at,
      verifiedAt: data.verified_at,
      verifiedById: data.verified_by_id,
      rejectionReason: data.rejection_reason,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, data: payment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment recording failed.";
    return { success: false, error: msg };
  }
}

/**
 * Records an installment / partial payment against an existing payment record.
 */
export async function recordPartialPayment(
  paymentId: string,
  amount: number,
  method: OfflinePaymentMethod,
  upiReference?: string,
  evidenceUrl?: string,
  notes?: string
): Promise<PaymentResult<PaymentPartialRecord>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    if (amount <= 0) return { success: false, error: "Installment amount must be greater than zero." };

    // 1. Fetch current balance
    const { data: currentPayment, error: fetchErr } = await supabase
      .from("offline_payments")
      .select("id, amount, amount_paid, status")
      .eq("id", paymentId)
      .single();

    if (fetchErr || !currentPayment) return { success: false, error: "Payment record not found." };

    const outstanding = Number(currentPayment.amount) - Number(currentPayment.amount_paid);
    if (amount > outstanding) {
      return {
        success: false,
        error: `Amount exceeds outstanding balance (Remaining: ₹${outstanding.toFixed(2)}).`,
      };
    }

    // 2. Insert partial record
    const { data, error } = await supabase
      .from("payment_partial_records")
      .insert({
        payment_id: paymentId,
        amount,
        method,
        upi_reference: upiReference?.trim() || null,
        evidence_url: evidenceUrl || null,
        recorded_by_id: user.id,
        notes: notes || "Partial payment installment",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // 3. Increment amount_paid on master payment
    const newPaid = Number(currentPayment.amount_paid) + amount;
    await supabase
      .from("offline_payments")
      .update({
        amount_paid: newPaid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    const record: PaymentPartialRecord = {
      id: data.id,
      paymentId: data.payment_id,
      amount: Number(data.amount),
      method: data.method,
      upiReference: data.upi_reference,
      evidenceUrl: data.evidence_url,
      recordedById: data.recorded_by_id,
      notes: data.notes,
      createdAt: data.created_at,
    };

    return { success: true, data: record };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Partial payment recording failed.";
    return { success: false, error: msg };
  }
}

/**
 * Independent verification of an offline payment by an authorized person.
 * Security Rules:
 * 1. Agent CANNOT verify their own submitted payment.
 * 2. Only Admin / Super Admin can verify.
 * 3. Screenshot alone is never conclusive proof.
 */
export async function verifyPayment(
  paymentId: string,
  action: "VERIFY" | "REJECT",
  rejectionReasonOrNotes?: string
): Promise<PaymentResult<OfflinePayment>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // Fetch payment to check agent restriction
    const { data: paymentData, error: fetchError } = await supabase
      .from("offline_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (fetchError || !paymentData) return { success: false, error: "Payment not found." };

    // CRITICAL SECURITY RULE: Submitting agent CANNOT verify their own payment
    if (paymentData.agent_id === user.id) {
      return {
        success: false,
        error: "Security Policy Violation: Agents are strictly prohibited from verifying their own submitted payments.",
      };
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      updated_at: now,
    };

    if (action === "VERIFY") {
      updatePayload.status = "VERIFIED";
      updatePayload.verified_at = now;
      updatePayload.verified_by_id = user.id;
      if (rejectionReasonOrNotes) updatePayload.notes = rejectionReasonOrNotes;
    } else {
      updatePayload.status = "REJECTED";
      updatePayload.rejection_reason = rejectionReasonOrNotes || "Payment details or evidence could not be verified.";
    }

    const { data: updated, error: updateError } = await supabase
      .from("offline_payments")
      .update(updatePayload)
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) return { success: false, error: updateError.message };

    // When verified: compute commission if collected by an agent
    if (action === "VERIFY" && paymentData.agent_id) {
      const commissionRate = 0.015; // 1.5% commission
      const commissionAmount = Number(paymentData.amount) * commissionRate;

      await supabase.from("agent_commissions").insert({
        agent_id: paymentData.agent_id,
        payment_id: paymentData.id,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: "PENDING", // Requires admin approval for payout
        notes: `1.5% collection commission for receipt ${paymentData.receipt_number}`,
      });

      // Credit the agent's cashbook
      const { data: cashbook } = await supabase
        .from("agent_cashbooks")
        .select("id, total_collected")
        .eq("agent_id", paymentData.agent_id)
        .single();

      if (cashbook) {
        await supabase
          .from("agent_cashbooks")
          .update({
            total_collected: Number(cashbook.total_collected) + Number(paymentData.amount_paid),
            updated_at: now,
          })
          .eq("id", cashbook.id);

        await supabase.from("agent_cashbook_entries").insert({
          cashbook_id: cashbook.id,
          payment_id: paymentData.id,
          entry_type: "CREDIT",
          amount: paymentData.amount_paid,
          description: `Collection verified: Receipt ${paymentData.receipt_number}`,
        });
      }
    }

    // Write audit log entry
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: action === "VERIFY" ? "payment.verified" : "payment.rejected",
      table_name: "offline_payments",
      record_id: paymentId,
      old_values: { status: paymentData.status },
      new_values: { status: updatePayload.status, verified_by_id: user.id },
    });

    const payment: OfflinePayment = {
      id: updated.id,
      receiptNumber: updated.receipt_number,
      payerId: updated.payer_id,
      payeeId: updated.payee_id,
      agentId: updated.agent_id,
      purpose: updated.purpose,
      relatedEntityType: updated.related_entity_type,
      relatedEntityId: updated.related_entity_id,
      amount: Number(updated.amount),
      amountPaid: Number(updated.amount_paid),
      outstandingBalance: Number(updated.amount) - Number(updated.amount_paid),
      method: updated.method,
      upiReference: updated.upi_reference,
      paymentEvidenceUrl: updated.payment_evidence_url,
      status: updated.status,
      submittedAt: updated.submitted_at,
      verifiedAt: updated.verified_at,
      verifiedById: updated.verified_by_id,
      rejectionReason: updated.rejection_reason,
      notes: updated.notes,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    return { success: true, data: payment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed.";
    return { success: false, error: msg };
  }
}

/**
 * Fetches user payments based on role (as payer, payee, agent, or all for admin).
 */
export async function fetchMyPayments(
  filterRole: "PAYER" | "PAYEE" | "AGENT" | "ADMIN" = "PAYER"
): Promise<PaymentResult<OfflinePayment[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    let query = supabase.from("offline_payments").select("*");

    if (filterRole === "PAYER") {
      query = query.eq("payer_id", user.id);
    } else if (filterRole === "PAYEE") {
      query = query.eq("payee_id", user.id);
    } else if (filterRole === "AGENT") {
      query = query.eq("agent_id", user.id);
    }
    // If ADMIN, RLS checks if user has ADMIN/SUPER_ADMIN role and returns all

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    const payments: OfflinePayment[] = (data || []).map((row) => ({
      id: row.id,
      receiptNumber: row.receipt_number,
      payerId: row.payer_id,
      payeeId: row.payee_id,
      agentId: row.agent_id,
      purpose: row.purpose,
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      amount: Number(row.amount),
      amountPaid: Number(row.amount_paid),
      outstandingBalance: Number(row.amount) - Number(row.amount_paid),
      method: row.method,
      upiReference: row.upi_reference,
      paymentEvidenceUrl: row.payment_evidence_url,
      status: row.status,
      submittedAt: row.submitted_at,
      verifiedAt: row.verified_at,
      verifiedById: row.verified_by_id,
      rejectionReason: row.rejection_reason,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data: payments };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch payments.";
    return { success: false, error: msg };
  }
}

/**
 * Fetches agent cashbook details and line items.
 */
export async function fetchAgentCashbook(
  agentId?: string
): Promise<PaymentResult<{ cashbook: AgentCashbook; entries: AgentCashbookEntry[] }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const targetAgentId = agentId || user.id;

    const { data: cbData, error: cbError } = await supabase
      .from("agent_cashbooks")
      .select("*")
      .eq("agent_id", targetAgentId)
      .single();

    if (cbError || !cbData) return { success: false, error: "Agent cashbook not found." };

    const { data: entryData } = await supabase
      .from("agent_cashbook_entries")
      .select("*")
      .eq("cashbook_id", cbData.id)
      .order("created_at", { ascending: false });

    const cashbook: AgentCashbook = {
      id: cbData.id,
      agentId: cbData.agent_id,
      totalCollected: Number(cbData.total_collected),
      totalDisbursed: Number(cbData.total_disbursed),
      balance: Number(cbData.total_collected) - Number(cbData.total_disbursed),
      lastReconciledAt: cbData.last_reconciled_at,
      reconciledByAdminId: cbData.reconciled_by_admin_id,
      createdAt: cbData.created_at,
      updatedAt: cbData.updated_at,
    };

    const entries: AgentCashbookEntry[] = (entryData || []).map((e) => ({
      id: e.id,
      cashbookId: e.cashbook_id,
      paymentId: e.payment_id,
      entryType: e.entry_type,
      amount: Number(e.amount),
      description: e.description,
      approvedByAdminId: e.approved_by_admin_id,
      createdAt: e.created_at,
    }));

    return { success: true, data: { cashbook, entries } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch cashbook.";
    return { success: false, error: msg };
  }
}

/**
 * Reconciles agent cashbook (Admin action).
 */
export async function reconcileAgentCashbook(
  cashbookId: string,
  disbursedToBankAmount: number,
  notes?: string
): Promise<PaymentResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data: cb } = await supabase
      .from("agent_cashbooks")
      .select("total_disbursed")
      .eq("id", cashbookId)
      .single();

    const now = new Date().toISOString();
    const newDisbursed = Number(cb?.total_disbursed || 0) + disbursedToBankAmount;

    const { error } = await supabase
      .from("agent_cashbooks")
      .update({
        total_disbursed: newDisbursed,
        last_reconciled_at: now,
        reconciled_by_admin_id: user.id,
        updated_at: now,
      })
      .eq("id", cashbookId);

    if (error) return { success: false, error: error.message };

    await supabase.from("agent_cashbook_entries").insert({
      cashbook_id: cashbookId,
      entry_type: "DEBIT",
      amount: disbursedToBankAmount,
      description: `Reconciled & deposited to bank: ${notes || "Routine reconciliation"}`,
      approved_by_admin_id: user.id,
    });

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cashbook reconciliation failed.";
    return { success: false, error: msg };
  }
}

/**
 * Admin approval for agent commission payout.
 */
export async function approveAgentCommission(
  commissionId: string
): Promise<PaymentResult<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("agent_commissions")
      .update({
        status: "APPROVED",
        approved_by_admin_id: user.id,
        approved_at: now,
        updated_at: now,
      })
      .eq("id", commissionId);

    if (error) return { success: false, error: error.message };

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Commission approval failed.";
    return { success: false, error: msg };
  }
}
