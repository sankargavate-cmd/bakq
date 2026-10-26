"use client";

import { useEffect, useState } from "react";
import {
  fetchMyPayments,
  recordOfflinePayment,
  verifyPayment,
  RecordPaymentInput,
} from "@/lib/supabasePayments";
import { getStoredRole, getStoredToken } from "@/lib/auth";
import {
  OfflinePayment,
  OfflinePaymentMethod,
  OfflinePaymentStatus,
  PaymentPurpose,
} from "@/types";
import styles from "./payments.module.css";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<OfflinePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<OfflinePayment | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<OfflinePaymentMethod>("CASH");
  const [purpose, setPurpose] = useState<PaymentPurpose>("PRODUCE_ORDER");
  const [upiRef, setUpiRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getStoredRole());
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    const role = getStoredRole();
    const filterRole = role === "ADMIN" || role === "SUPER_ADMIN" ? "ADMIN" : "PAYER";
    const res = await fetchMyPayments(filterRole);
    if (res.success && res.data) {
      setPayments(res.data);
    }
    setLoading(false);
  }

  async function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setFormError("Please enter a valid payment amount.");
      setSubmitting(false);
      return;
    }

    if (method === "UPI" && (!upiRef.trim() || upiRef.trim().length < 6)) {
      setFormError("Please enter a valid 12-digit UPI Transaction / UTR reference.");
      setSubmitting(false);
      return;
    }

    const payload: RecordPaymentInput = {
      payerId: "00000000-0000-0000-0000-000000000000", // Will be inferred by auth session
      payeeId: "00000000-0000-0000-0000-000000000000",
      amount: numAmount,
      initialAmountPaid: numAmount,
      method,
      purpose,
      upiReference: method === "UPI" ? upiRef.trim() : null,
      notes: notes.trim() || null,
    };

    const res = await recordOfflinePayment(payload);
    setSubmitting(false);

    if (res.success && res.data) {
      setShowModal(false);
      resetForm();
      loadPayments();
    } else {
      setFormError(res.error || "Failed to record payment.");
    }
  }

  async function handleVerify(paymentId: string, action: "VERIFY" | "REJECT") {
    const res = await verifyPayment(paymentId, action);
    if (res.success) {
      loadPayments();
    } else {
      alert(res.error || "Verification failed.");
    }
  }

  function resetForm() {
    setAmount("");
    setMethod("CASH");
    setPurpose("PRODUCE_ORDER");
    setUpiRef("");
    setNotes("");
    setFormError(null);
  }

  const filtered = payments.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Offline Payments & Receipts</h1>
            <p className={styles.subtitle}>
              Verifiable Cash and UPI collections with unique receipts.
            </p>
          </div>
          <button className={styles.recordBtn} onClick={() => setShowModal(true)}>
            + Record Offline Payment
          </button>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          {["ALL", "SUBMITTED", "VERIFIED", "REJECTED"].map((status) => (
            <button
              key={status}
              className={`${styles.filterChip} ${
                filterStatus === status ? styles.filterChipActive : ""
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Payment List */}
        {loading ? (
          <div className={styles.emptyState}>Loading payment records…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No offline payment records found for this filter.</p>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.paymentCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.receiptNo}>🧾 {item.receiptNumber}</span>
                  <span
                    className={
                      item.status === "VERIFIED"
                        ? styles.badgeVerified
                        : item.status === "SUBMITTED"
                        ? styles.badgeSubmitted
                        : styles.badgeRejected
                    }
                  >
                    {item.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div>
                    <div className={styles.label}>Purpose</div>
                    <div className={styles.val}>{item.purpose.replace(/_/g, " ")}</div>
                  </div>
                  <div>
                    <div className={styles.label}>Method</div>
                    <div className={styles.val}>{item.method}</div>
                  </div>
                  <div>
                    <div className={styles.label}>Amount Paid</div>
                    <div className={styles.val} style={{ color: "#2b6a39" }}>
                      ₹{item.amountPaid.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className={styles.label}>Balance Due</div>
                    <div className={styles.val}>
                      ₹{item.outstandingBalance.toLocaleString("en-IN")}
                    </div>
                  </div>
                  {item.upiReference && (
                    <div>
                      <div className={styles.label}>UPI / UTR Ref</div>
                      <div className={styles.val} style={{ fontSize: "0.85rem" }}>
                        {item.upiReference}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className={styles.label}>Date</div>
                    <div className={styles.val} style={{ fontSize: "0.85rem" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Admin Verification Controls */}
                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") &&
                  item.status === "SUBMITTED" && (
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleVerify(item.id, "VERIFY")}
                        style={{
                          background: "#2b6a39",
                          color: "#fff",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ✓ Verify Payment
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, "REJECT")}
                        style={{
                          background: "#b3261e",
                          color: "#fff",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Record Payment */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Record Offline Payment</h2>
              {formError && (
                <div
                  style={{
                    background: "#fdecea",
                    color: "#b3261e",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {formError}
                </div>
              )}
              <form onSubmit={handleRecordSubmit}>
                <div className={styles.formField}>
                  <label>Payment Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as PaymentPurpose)}
                  >
                    <option value="PRODUCE_ORDER">Produce Order Purchase</option>
                    <option value="WORK_REQUEST">Labour Wage Payment</option>
                    <option value="TRACTOR_BOOKING">Tractor Hire Charges</option>
                    <option value="TRANSPORT_BOOKING">Transport Delivery Fee</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as OfflinePaymentMethod)}
                  >
                    <option value="CASH">Cash Collection (रोख रक्कम)</option>
                    <option value="UPI">Direct UPI Transfer (युपीआय)</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Amount (₹ रक्कम)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {method === "UPI" && (
                  <div className={styles.formField}>
                    <label>12-Digit UPI Transaction / UTR Reference</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 428901234567"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                    />
                    <small style={{ color: "#5b6659", display: "block", marginTop: "4px" }}>
                      *Required for independent UPI verification. Screenshots alone are not sufficient proof.
                    </small>
                  </div>
                )}

                <div className={styles.formField}>
                  <label>Notes / Remarks (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Received at Niphad APMC yard"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className={styles.btnRow}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.recordBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Recording…" : "Generate Receipt →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
