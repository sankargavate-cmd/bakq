"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredRole, getStoredToken } from "@/lib/auth";
import {
  fetchPendingVerifications,
  reviewProviderVerification,
  fetchComplaints,
  resolveComplaint,
  fetchAuditLogs,
  fetchGovernmentSchemesSupabase,
  verifySchemeByAdmin,
  PendingVerificationItem,
} from "@/lib/supabaseAdmin";
import {
  Complaint,
  AuditLog,
  DatabaseGovernmentScheme,
} from "@/types";
import styles from "./farmer-verification/farmer-verification.module.css";

type AdminTab = "verifications" | "complaints" | "schemes" | "audit";

export default function AdminDashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("verifications");
  const [loading, setLoading] = useState(true);

  // Data states
  const [verifications, setVerifications] = useState<PendingVerificationItem[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [schemes, setSchemes] = useState<DatabaseGovernmentScheme[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Action states
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingItem, setRejectingItem] = useState<PendingVerificationItem | null>(null);

  // Complaint resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    const r = getStoredRole();
    setRole(r);
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const [vRes, cRes, sRes, aRes] = await Promise.all([
      fetchPendingVerifications(),
      fetchComplaints(true),
      fetchGovernmentSchemesSupabase(),
      fetchAuditLogs(30),
    ]);

    if (vRes.success && vRes.data) setVerifications(vRes.data);
    if (cRes.success && cRes.data) setComplaints(cRes.data);
    if (sRes.success && sRes.data) setSchemes(sRes.data);
    if (aRes.success && aRes.data) setAuditLogs(aRes.data);

    setLoading(false);
  }

  async function handleVerification(
    item: PendingVerificationItem,
    action: "APPROVE" | "REJECT"
  ) {
    setActioningId(item.profileId);
    const res = await reviewProviderVerification(
      item.role,
      item.profileId,
      item.userId,
      action,
      action === "REJECT" ? rejectReason : undefined
    );
    setActioningId(null);
    setRejectingItem(null);
    setRejectReason("");

    if (res.success) {
      loadAllData();
    } else {
      alert(res.error || "Action failed.");
    }
  }

  async function handleResolveComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvingComplaint) return;
    if (!resolutionNotes.trim()) {
      alert("Please enter resolution notes.");
      return;
    }

    const res = await resolveComplaint(resolvingComplaint.id, "RESOLVED", resolutionNotes);
    if (res.success) {
      setResolvingComplaint(null);
      setResolutionNotes("");
      loadAllData();
    } else {
      alert(res.error || "Failed to resolve complaint.");
    }
  }

  async function handleVerifyScheme(schemeId: string) {
    const res = await verifySchemeByAdmin(schemeId);
    if (res.success) {
      loadAllData();
    } else {
      alert(res.error || "Failed to verify scheme.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Taluka Agriculture Officer · प्रशासक नियंत्रण कक्ष</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 className={styles.title}>Admin Control Center</h1>
            <p className={styles.subtitle}>
              Review land records, verify offline payments, manage complaints, and audit records.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href="/payments"
              style={{
                background: "#2b6a39",
                color: "#fff",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: "600",
              }}
            >
              🧾 Verify Payments
            </Link>
            <Link
              href="/agent/cashbook"
              style={{
                background: "#0d47a1",
                color: "#fff",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: "600",
              }}
            >
              💼 Agent Cashbooks
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #dde3d9", paddingBottom: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setActiveTab("verifications")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              background: activeTab === "verifications" ? "#2b6a39" : "#fff",
              color: activeTab === "verifications" ? "#fff" : "#5b6659",
            }}
          >
            📋 Verification Queue ({verifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("complaints")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              background: activeTab === "complaints" ? "#2b6a39" : "#fff",
              color: activeTab === "complaints" ? "#fff" : "#5b6659",
            }}
          >
            ⚠️ Complaints ({complaints.filter((c) => c.status === "OPEN").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schemes")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              background: activeTab === "schemes" ? "#2b6a39" : "#fff",
              color: activeTab === "schemes" ? "#fff" : "#5b6659",
            }}
          >
            🏛️ Government Schemes ({schemes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              background: activeTab === "audit" ? "#2b6a39" : "#fff",
              color: activeTab === "audit" ? "#fff" : "#5b6659",
            }}
          >
            🛡️ Security Audit Log
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === "verifications" && (
          <div>
            {loading ? (
              <p>Loading verification queue…</p>
            ) : verifications.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px dashed #dde3d9" }}>
                <h3>All verification queues are clear!</h3>
                <p style={{ color: "#5b6659" }}>No pending farmer 7/12 land records or provider profiles awaiting review.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {verifications.map((item) => (
                  <div
                    key={item.profileId}
                    style={{
                      background: "#fff",
                      border: "1px solid #dde3d9",
                      borderRadius: "10px",
                      padding: "1.25rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", background: "#eef4ec", color: "#2b6a39", padding: "0.2rem 0.5rem", borderRadius: "4px", marginRight: "0.5rem" }}>
                          {item.role.replace(/_/g, " ")}
                        </span>
                        <h3 style={{ margin: "0.35rem 0 0.15rem 0", fontSize: "1.1rem" }}>{item.name}</h3>
                        <p style={{ margin: 0, color: "#5b6659", fontSize: "0.85rem" }}>📍 {item.location} · 📞 {item.mobile}</p>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#8a6d1f", background: "#fbf3da", padding: "0.25rem 0.6rem", borderRadius: "12px", fontWeight: "600" }}>
                        Pending Review
                      </span>
                    </div>

                    <p style={{ fontSize: "0.9rem", background: "#fbfaf7", padding: "0.6rem", borderRadius: "6px", margin: "0.5rem 0" }}>
                      {item.details}
                    </p>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <button
                        type="button"
                        disabled={actioningId === item.profileId}
                        onClick={() => handleVerification(item, "APPROVE")}
                        style={{
                          background: "#2b6a39",
                          color: "#fff",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✓ Verify & Approve
                      </button>
                      <button
                        type="button"
                        disabled={actioningId === item.profileId}
                        onClick={() => setRejectingItem(item)}
                        style={{
                          background: "#b3261e",
                          color: "#fff",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Complaints & Disputes */}
        {activeTab === "complaints" && (
          <div>
            {complaints.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px dashed #dde3d9" }}>
                <h3>No complaints filed</h3>
                <p style={{ color: "#5b6659" }}>Platform is operating smoothly with 0 active disputes.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #dde3d9",
                      borderRadius: "10px",
                      padding: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", background: "#fdecea", color: "#b3261e", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {c.category}
                        </span>
                        <h3 style={{ margin: "0.35rem 0", fontSize: "1.05rem" }}>{c.subject}</h3>
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: c.status === "RESOLVED" ? "#2b6a39" : "#b3261e" }}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#333", margin: "0.5rem 0" }}>{c.description}</p>
                    {c.resolutionNotes && (
                      <p style={{ fontSize: "0.85rem", color: "#2b6a39", background: "#eef4ec", padding: "0.5rem", borderRadius: "6px" }}>
                        <strong>Resolution:</strong> {c.resolutionNotes}
                      </p>
                    )}
                    {c.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() => setResolvingComplaint(c)}
                        style={{
                          background: "#2b6a39",
                          color: "#fff",
                          border: "none",
                          padding: "0.45rem 0.9rem",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                        }}
                      >
                        Resolve Grievance
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Government Schemes */}
        {activeTab === "schemes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {schemes.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "#fff",
                  border: "1px solid #dde3d9",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#2b6a39" }}>{s.shortCode}</span>
                  <h3 style={{ margin: "0.25rem 0", fontSize: "1.1rem" }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#5b6659" }}>
                    Authority: {s.authority} · Benefit: {s.maxBenefit || s.subsidyPercent}
                  </p>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#8a6d1f" }}>
                    Last Verified: {s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toLocaleDateString("en-IN") : "Pending Initial Audit"}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleVerifyScheme(s.id)}
                    style={{
                      background: "#2b6a39",
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    ✓ Mark Verified Today
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Security Audit Log */}
        {activeTab === "audit" && (
          <div style={{ background: "#fff", border: "1px solid #dde3d9", borderRadius: "10px", padding: "1.25rem" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Immutable System Audit Log</h3>
            <p style={{ fontSize: "0.85rem", color: "#5b6659", marginBottom: "1rem" }}>
              Every privilege change, payment verification, and verification decision is permanently recorded.
            </p>
            {auditLogs.length === 0 ? (
              <p>No audit events recorded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div>
                      <strong style={{ fontFamily: "monospace", color: "#1e4029" }}>{log.action}</strong>
                      <span style={{ color: "#5b6659", marginLeft: "0.5rem" }}>
                        on {log.tableName || "system"} ({log.recordId?.slice(0, 8)}…)
                      </span>
                    </div>
                    <span style={{ color: "#888", fontSize: "0.8rem" }}>
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              zIndex: 1000,
            }}
          >
            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "10px", maxWidth: "480px", width: "100%" }}>
              <h3 style={{ marginTop: 0 }}>Reject {rejectingItem.name}&apos;s Profile</h3>
              <p style={{ fontSize: "0.9rem", color: "#5b6659" }}>
                Please provide an official reason for rejection (e.g. invalid 7/12 land extract, blurred photo).
              </p>
              <textarea
                rows={3}
                required
                placeholder="Reason for rejection…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  style={{ background: "#eee", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerification(rejectingItem, "REJECT")}
                  style={{ background: "#b3261e", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complaint Resolution Modal */}
        {resolvingComplaint && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              zIndex: 1000,
            }}
          >
            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "10px", maxWidth: "500px", width: "100%" }}>
              <h3 style={{ marginTop: 0 }}>Resolve Grievance: {resolvingComplaint.subject}</h3>
              <form onSubmit={handleResolveComplaintSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                    Resolution Notes & Action Taken
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Document mediation outcome, refund, or settlement details…"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setResolvingComplaint(null)}
                    style={{ background: "#eee", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: "#2b6a39", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                  >
                    Mark Resolved
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
