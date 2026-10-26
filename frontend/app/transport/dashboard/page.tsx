"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import styles from "./dashboard.module.css";

export default function TransportDashboardPage() {
  const [transport, setTransport] = useState({
    name: "Maruti Agro Logistics",
    location: "Miraj, Sangli, Maharashtra",
    rate: "₹28 / km",
    fleet: "5-Ton Bolero Maxi Truck & 10-Ton Eicher",
  });

  useEffect(() => {
    const demo = getCurrentDemoPersona();
    if (demo && demo.role === "TRANSPORT_PROVIDER") {
      setTransport({
        name: demo.name,
        location: demo.location,
        rate: "₹28 / km",
        fleet: "5T & 10T Farm-to-Mandi Covered Trucks",
      });
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Shetkari Sathi · शेतकरी साथी</div>
        <h1 className={styles.title}>Transport & Agro Logistics Hub</h1>
        <p className={styles.subtitle}>
          Manage farm-to-mandi freight bookings, trip schedules, and vehicle fleet.
        </p>

        {/* Transport Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.profileLeft}>
            <div className={styles.avatar}>🚚</div>
            <div className={styles.info}>
              <h2>{transport.name}</h2>
              <p>📍 {transport.location} · {transport.fleet}</p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>5T & 10T</span>
              <span className={styles.statLbl}>Capacity</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>{transport.rate}</span>
              <span className={styles.statLbl}>Freight Rate</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>115+</span>
              <span className={styles.statLbl}>Mandi Trips</span>
            </div>
          </div>
        </div>

        {/* Action Modules */}
        <div className={styles.grid}>
          <Link href="/transport/bookings" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
                <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
                <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Farmer Crop Dispatch Requests</span>
                <span className={styles.badge}>Active</span>
              </span>
              <span className={styles.tileDescription}>
                Review onion, soybean, and grain transportation requests to APMC Pune and Mumbai.
              </span>
            </span>
          </Link>

          <Link href="/transport/profile" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Vehicle Specs & Per-KM Rates</span>
              </span>
              <span className={styles.tileDescription}>
                Update your vehicle tonnage, permit areas, and per-kilometer freight pricing.
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
                <span className={styles.tileLabel}>Govt Agri Logistics Schemes</span>
              </span>
              <span className={styles.tileDescription}>
                Explore cold chain and refrigerated vehicle subsidies under PM Kisan SAMPADA Yojana.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
