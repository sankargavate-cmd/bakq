"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import styles from "./dashboard.module.css";

interface DashboardItem {
  key: string;
  label: string;
  description: string;
  icon: ReactNode;
  href?: string;
  badge?: string;
  isFeatured?: boolean;
}

const DASHBOARD_ITEMS: DashboardItem[] = [
  {
    key: "schemes",
    label: "Government Schemes Hub",
    description: "Apply for 90% Solar Pump subsidy, PM-KISAN ₹12,000, & ₹1 Fasal Bima",
    href: "/schemes",
    badge: "90% Subsidy",
    isFeatured: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
      </svg>
    ),
  },
  {
    key: "sell",
    label: "Sell Produce (मार्केटप्लेस)",
    description: "List harvest directly for APMC & retail buyers with 0% commission",
    href: "/farmer/produce",
    badge: "0% Commission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 9.5h15l-1.6 9a2 2 0 0 1-2 1.7H8.1a2 2 0 0 1-2-1.7l-1.6-9Z" />
        <path d="M8.5 9.5 10.5 4.5h3l2 5" />
      </svg>
    ),
  },
  {
    key: "produceOffers",
    label: "Produce Offers (खरेदीदार ऑफर्स)",
    description: "Review and accept buyer price bids on your listed produce",
    href: "/farmer/offers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
        <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
        <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
      </svg>
    ),
  },
  {
    key: "tractor",
    label: "Find Tractor & Implements",
    description: "Book verified tractors, rotavators, & harvesters near your village",
    href: "/farmer/tractor-search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="17.5" r="3" />
        <circle cx="17" cy="17.5" r="2.2" />
        <path d="M3.5 17.5V9h3.8l2.4 4h3.6l1.4-3h3.3v3.5" />
        <path d="M8.5 9V5h3" />
      </svg>
    ),
  },
  {
    key: "tractorBookings",
    label: "My Tractor Bookings",
    description: "Track tractor and machinery bookings you have requested",
    href: "/farmer/tractor-bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
        <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
        <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
      </svg>
    ),
  },
  {
    key: "labour",
    label: "Find Farm Labour (शेतमजूर)",
    description: "Hire skilled sowing, harvest, and weeding labour squads",
    href: "/farmer/labour-search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7.5" r="2.8" />
        <path d="M3.5 19c0-3.3 2.5-5.3 5.5-5.3s5.5 2 5.5 5.3" />
        <circle cx="17.5" cy="7" r="2.1" />
        <path d="M14.9 13.9c2.4.4 4.1 2.2 4.1 5.1" />
      </svg>
    ),
  },
  {
    key: "workRequests",
    label: "My Labour Requests",
    description: "Track labour contracts and work confirmations",
    href: "/farmer/work-requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
        <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
        <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
      </svg>
    ),
  },
  {
    key: "transport",
    label: "Find Transport (मालवाहतूक)",
    description: "Arrange Bolero pickups & trucks to transport crops to mandis",
    href: "/farmer/transport-search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="9" width="10" height="7" rx="1" />
        <path d="M12.5 11.5h4l3 3v1.5h-7z" />
        <circle cx="6" cy="17.5" r="1.7" />
        <circle cx="16.5" cy="17.5" r="1.7" />
      </svg>
    ),
  },
  {
    key: "transportBookings",
    label: "My Transport Bookings",
    description: "Track crop dispatch and truck logistics status",
    href: "/farmer/transport-bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="6.5" width="17" height="13" rx="1.6" />
        <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
        <path d="M7.5 12.5l2.4 2.4 5.6-5.4" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Farmer Profile (माझे प्रोफाइल)",
    description: "View and update your 7/12 land records, Aadhaar, & bank details",
    href: "/farmer/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
      </svg>
    ),
  },
];

export default function FarmerDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [farmer, setFarmer] = useState({
    name: "Ramesh Dnyaneshwar Patil",
    village: "Dindori",
    district: "Nashik, Maharashtra",
    land: "5.2 Acres (Gat No. 142/2)",
    crops: "Cotton, Soybean & Grapes",
  });

  useEffect(() => {
    setToken(getStoredToken());
    const demo = getCurrentDemoPersona();
    if (demo && demo.role === "FARMER") {
      setFarmer({
        name: demo.name,
        village: "Dindori",
        district: demo.location,
        land: "5.2 Acres (Gat No. 142/2)",
        crops: "Cotton, Soybean & Grapes",
      });
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <div>
            <div className={styles.eyebrow}>Shetkari Sathi · शेतकरी साथी</div>
            <h1 className={styles.title}>Farmer Control Dashboard</h1>
            <p className={styles.subtitle}>
              Everything you need for your farm in one place.
            </p>
          </div>
          <Link href="/schemes" className="neu-button neu-button-amber">
            🏛️ View 90% Govt Schemes →
          </Link>
        </div>

        {/* Farmer Profile Summary Card */}
        <div className={styles.farmerSummaryCard}>
          <div className={styles.farmerAvatar}>👨‍🌾</div>
          <div className={styles.farmerDetails}>
            <h2>{farmer.name}</h2>
            <p>
              📍 {farmer.village}, {farmer.district} · 🌱 {farmer.land} · Crops: {farmer.crops}
            </p>
          </div>
          <div className={styles.farmerStatsRow}>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>3</span>
              <span className={styles.statLbl}>Schemes Active</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>2 Lots</span>
              <span className={styles.statLbl}>Produce Listed</span>
            </div>
            <div className={styles.statBadge}>
              <span className={styles.statVal}>1</span>
              <span className={styles.statLbl}>Tractor Booked</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <div className={styles.aiBanner}>
          <div className={styles.aiBannerText}>
            <span className={styles.aiBannerIcon}>🌾</span>
            <div>
              <h3>Have Pest Issues or Questions about Solar Pump Subsidy?</h3>
              <p>
                Kisan Sathi AI Assistant is online to diagnose crop diseases and calculate scheme benefits.
              </p>
            </div>
          </div>
          <span className="neu-badge-green">AI Active 24/7</span>
        </div>

        {/* Dashboard Modules Grid */}
        <div className={styles.grid}>
          {DASHBOARD_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href || "#"}
              className={`${styles.tile} ${item.isFeatured ? styles.tileFeatured : ""}`}
            >
              <span className={styles.tileIcon}>{item.icon}</span>
              <span className={styles.tileBody}>
                <span className={styles.tileHeadRow}>
                  <span className={styles.tileLabel}>{item.label}</span>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </span>
                <span className={styles.tileDescription}>{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
