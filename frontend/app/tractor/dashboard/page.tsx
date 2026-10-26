"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import styles from "./dashboard.module.css";

export default function TractorDashboardPage() {
  const [tractor, setTractor] = useState({
    name: "Ganesh Krishi Yantra",
    location: "Shirol, Kolhapur, Maharashtra",
    rate: "₹850 / hr",
    machinery: "Mahindra 575 DI (55HP) + Harvester",
  });

  useEffect(() => {
    const demo = getCurrentDemoPersona();
    if (demo && demo.role === "TRACTOR_OWNER") {
      setTractor({
        name: demo.name,
        location: demo.location,
        rate: "₹850 / hr",
        machinery: "55HP Tractor + Harvester & Rotavator",
      });
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Shetkari Sathi · शेतकरी साथी</div>
        <h1 className={styles.title}>Tractor & Custom Hiring Centre</h1>
        <p className={styles.subtitle}>
          Manage farm equipment bookings, plowing schedules, and machinery dispatch.
        </p>

        {/* Tractor Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.profileLeft}>
            <div className={styles.avatar}>🚜</div>
            <div className={styles.info}>
              <h2>{tractor.name}</h2>
              <p>📍 {tractor.location} · {tractor.machinery}</p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>55 HP</span>
              <span className={styles.statLbl}>Tractor</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>{tractor.rate}</span>
              <span className={styles.statLbl}>Hourly Rate</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>35 km</span>
              <span className={styles.statLbl}>Service Radius</span>
            </div>
          </div>
        </div>

        {/* Action Modules */}
        <div className={styles.grid}>
          <Link href="/tractor/bookings" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
                <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
                <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Farmer Machinery Bookings</span>
                <span className={styles.badge}>Active</span>
              </span>
              <span className={styles.tileDescription}>
                Review plowing, sowing, and rotavator rental requests from local farmers.
              </span>
            </span>
          </Link>

          <Link href="/tractor/profile" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Machinery Specs & Rates</span>
              </span>
              <span className={styles.tileDescription}>
                Update your hourly rates, attached implements list, and service availability.
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
                <span className={styles.tileLabel}>SMAM 50% Machinery Subsidy</span>
              </span>
              <span className={styles.tileDescription}>
                Apply for government grants on purchasing new tractors, power tillers, and harvesters.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
