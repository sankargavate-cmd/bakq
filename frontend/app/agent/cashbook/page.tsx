"use client";

import { useEffect, useState } from "react";
import { fetchAgentCashbook, reconcileAgentCashbook } from "@/lib/supabasePayments";
import { getStoredRole } from "@/lib/auth";
import { AgentCashbook, AgentCashbookEntry } from "@/types";
import styles from "@/app/payments/payments.module.css";

export default function AgentCashbookPage() {
  const [cashbook, setCashbook] = useState<AgentCashbook | null>(null);
  const [entries, setEntries] = useState<AgentCashbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [reconciling, setReconciling] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getStoredRole());
    loadCashbook();
  }, []);

  async function loadCashbook() {
    setLoading(true);
    const res = await fetchAgentCashbook();
    if (res.success && res.data) {
      setCashbook(res.data.cashbook);
      setEntries(res.data.entries);
    }
    setLoading(false);
  }

  async function handleReconcile(e: React.FormEvent) {
    e.preventDefault();
    if (!cashbook) return;
    const num = Number(depositAmount);
    if (!num || num <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    setReconciling(true);
    const res = await reconcileAgentCashbook(cashbook.id, num);
    setReconciling(false);
    if (res.success) {
      setDepositAmount("");
      loadCashbook();
    } else {
      alert(res.error || "Reconciliation failed.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Agent Daily Cashbook</h1>
            <p className={styles.subtitle}>
              Track physical cash collections, bank deposits, and reconciliation.
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading cashbook data…</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #dde3d9",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#5b6659", textTransform: "uppercase" }}>
                  Total Collected (जमा रक्कम)
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#1e4029" }}>
                  ₹{(cashbook?.totalCollected || 0).toLocaleString("en-IN")}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  padding: "1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #dde3d9",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#5b6659", textTransform: "uppercase" }}>
                  Disbursed / Deposited (बँकेत भरणा)
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#0d47a1" }}>
                  ₹{(cashbook?.totalDisbursed || 0).toLocaleString("en-IN")}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  padding: "1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #dde3d9",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#5b6659", textTransform: "uppercase" }}>
                  Cash in Hand (शिल्लक रोख)
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#8a5a00" }}>
                  ₹{(cashbook?.balance || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Reconciliation Form for Admin */}
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
              <div
                style={{
                  background: "#fdf3e0",
                  padding: "1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #f0d090",
                  marginBottom: "2rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#8a5a00" }}>
                  Admin Action: Reconcile & Verify Bank Deposit
                </h3>
                <form
                  onSubmit={handleReconcile}
                  style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}
                >
                  <input
                    type="number"
                    min="1"
                    placeholder="Deposit Amount (₹)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      width: "200px",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={reconciling}
                    style={{
                      background: "#8a5a00",
                      color: "#fff",
                      border: "none",
                      padding: "0.55rem 1.2rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {reconciling ? "Saving…" : "Mark Reconciled"}
                  </button>
                </form>
              </div>
            )}

            {/* Ledger Entries */}
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem" }}>
              Ledger Transactions (दैनंदिन नोंदी)
            </h2>

            {entries.length === 0 ? (
              <div className={styles.emptyState}>No ledger transactions recorded yet.</div>
            ) : (
              <div className={styles.cardGrid}>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      background: "#fff",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #dde3d9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600" }}>{entry.description}</div>
                      <div style={{ fontSize: "0.8rem", color: "#5b6659" }}>
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        color: entry.entryType === "CREDIT" ? "#2b6a39" : "#0d47a1",
                      }}
                    >
                      {entry.entryType === "CREDIT" ? "+" : "-"}₹
                      {entry.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
