"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import styles from "./dashboard.module.css";

export default function BuyerDashboardPage() {
  const [buyer, setBuyer] = useState({
    name: "Vikram Agro Foods",
    location: "Gultekdi Market Yard, Pune",
    type: "Licensed APMC Wholesale Buyer",
  });

  useEffect(() => {
    const demo = getCurrentDemoPersona();
    if (demo && demo.role === "BUYER") {
      setBuyer({
        name: demo.name,
        location: demo.location,
        type: demo.title,
      });
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Shetkari Sathi · शेतकरी साथी</div>
        <h1 className={styles.title}>Buyer & Trader Portal</h1>
        <p className={styles.subtitle}>
          Direct sourcing from verified Maharashtra farmers with transparent quality testing.
        </p>

        {/* Buyer Summary Card */}
        <div className={styles.buyerSummaryCard}>
          <div className={styles.buyerProfileLeft}>
            <div className={styles.buyerAvatar}>🛒</div>
            <div className={styles.buyerInfo}>
              <h2>{buyer.name}</h2>
              <p>📍 {buyer.location} · {buyer.type}</p>
            </div>
          </div>

          <div className={styles.buyerStatsRow}>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>4 Active</span>
              <span className={styles.statLbl}>Price Bids</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>140+ T</span>
              <span className={styles.statLbl}>Procured</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>0%</span>
              <span className={styles.statLbl}>Commission</span>
            </div>
          </div>
        </div>

        {/* Dashboard Actions Grid */}
        <div className={styles.grid}>
          <Link href="/buyer/marketplace" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 9.5h15l-1.6 9a2 2 0 0 1-2 1.7H8.1a2 2 0 0 1-2-1.7l-1.6-9Z" />
                <path d="M8.5 9.5 10.5 4.5h3l2 5" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>Browse Produce Marketplace</span>
                <span className={styles.badge}>Live Lots</span>
              </span>
              <span className={styles.tileDescription}>
                Search fresh Onion, Soybean, Cotton, Wheat, and Tomato listed directly by verified farmers.
              </span>
            </span>
          </Link>

          <Link href="/buyer/offers" className={styles.tile}>
            <span className={styles.tileIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
                <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
                <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
              </svg>
            </span>
            <span className={styles.tileBody}>
              <span className={styles.tileHeadRow}>
                <span className={styles.tileLabel}>My Active Offers & Bids</span>
              </span>
              <span className={styles.tileDescription}>
                Track price negotiations, accepted farmer lots, and delivery schedules.
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
                <span className={styles.tileLabel}>Govt Agricultural Schemes</span>
              </span>
              <span className={styles.tileDescription}>
                View APMC trade rules, market intervention schemes, and warehouse receipt financing.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
