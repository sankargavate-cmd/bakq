"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import styles from "./dashboard.module.css";

export default function LabourDashboardPage() {
  const [labour, setLabour] = useState({
    name: "Sunil Baban Shinde",
    location: "Karad, Satara, Maharashtra",
    rate: "₹450 / day",
    skills: "Harvest, Sowing, Weeding",
  });

  useEffect(() => {
    const demo = getCurrentDemoPersona();
    if (demo && demo.role === "LABOUR") {
      setLabour({
        name: demo.name,
        location: demo.location,
        rate: "₹450 / day",
        skills: "Harvest & Sowing Specialist",
      });
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Shetkari Sathi · शेतकरी साथी</div>
        <h1 className={styles.title}>Labour & Farm Worker Hub</h1>
        <p className={styles.subtitle}>
          Direct farm employment contracts with timely daily wage payouts.
        </p>

        {/* Labour Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.profileLeft}>
            <div className={styles.avatar}>👷‍♂️</div>
            <div className={styles.info}>
              <h2>{labour.name}</h2>
              <p>📍 {labour.location} · Skills: {labour.skills}</p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>4.9 ★</span>
              <span className={styles.statLbl}>38 Reviews</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>{labour.rate}</span>
              <span className={styles.statLbl}>Daily Wage</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>42</span>
              <span className={styles.statLbl}>Jobs Done</span>
            </div>
          </div>
        </div>

        {/* Action Modules */}
        <div className={styles.grid}>
          <Link href="/labour/work-requests" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
                <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
                <path d="M3.5 12h17" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Farmer Work Requests</span>
                <span className={styles.badge}>Incoming</span>
              </span>
              <span className={styles.tileDescription}>
                Review requests from farmers in your village for sugarcane harvesting and sowing.
              </span>
            </span>
          </Link>

          <Link href="/labour/profile" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Worker Profile & Rates</span>
              </span>
              <span className={styles.tileDescription}>
                Update your squad size, daily wage rate, and availability calendar.
              </span>
            </span>
          </Link>

          <Link href="/schemes" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Agricultural Labour Schemes</span>
              </span>
              <span className={styles.tileDescription}>
                Explore accidental insurance and government welfare schemes for agricultural workers.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
