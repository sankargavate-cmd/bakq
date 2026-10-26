"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_PERSONAS, loginAsDemoUser } from "@/lib/demoAccounts";
import { getStoredLanguage, LanguageCode } from "@/lib/language";
import { getDashboardPathForRole } from "@/lib/auth";
import { Role } from "@/types";
import styles from "./welcome.module.css";

export default function WelcomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => {
    setLang(getStoredLanguage() || "en");
  }, []);

  function handleDemoLaunch(role: Role) {
    loginAsDemoUser(role);
    const dest = getDashboardPathForRole(role);
    router.push(dest);
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <div className={styles.badgePill}>
              <span className={styles.badgePulseDot} />
              <span>
                {lang === "mr"
                  ? "डिजिटल कृषी व योजना व्यासपीठ"
                  : "Digital Agriculture & Schemes Hub"}
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              {lang === "mr" ? (
                <>
                  शेतकऱ्यांचा खरा साथी,{" "}
                  <span className={styles.heroTitleHighlight}>
                    प्रत्येक हंगामात सोबत!
                  </span>
                </>
              ) : (
                <>
                  Empowering Farmers with{" "}
                  <span className={styles.heroTitleHighlight}>
                    Direct Schemes & Markets
                  </span>
                </>
              )}
            </h1>

            <p className={styles.heroSubtitle}>
              {lang === "mr"
                ? "९०% सौर पंप अनुदान, थेट पीक विक्री, ट्रॅक्टर व अवजारे बुकिंग, शेतमजूर आणि किसान साथी AI सहाय्यक — सर्वकाही एकाच ठिकाणी."
                : "Apply for 90% Solar Pump Subsidies, sell harvest directly to verified buyers with 0% commission, hire tractors, and get instant answers with Kisan Sathi AI."}
            </p>

            <div className={styles.heroActionRow}>
              <button
                type="button"
                className="neu-button neu-button-primary"
                onClick={() => handleDemoLaunch("FARMER")}
              >
                ⚡ {lang === "mr" ? "शेतकरी डेमो खात्यात जा" : "Explore as Farmer (Demo)"}
              </button>
              <Link href="/schemes" className="neu-button">
                🏛️ {lang === "mr" ? "शासकीय योजना पहा" : "Govt Schemes Hub"}
              </Link>
            </div>
          </div>

          {/* Right Live Mandi & Stats Widget */}
          <div className={styles.heroVisualCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetTitle}>
                📈 {lang === "mr" ? "थेट बाजारभाव (Live Mandi)" : "Live APMC Mandi Rates"}
              </span>
              <span className="neu-badge-green">Live Today</span>
            </div>

            <div className={styles.mandiTicker}>
              <div className={styles.tickerItem}>
                <span className={styles.tickerCrop}>🧅 Onion (नाशिक कांदा)</span>
                <span className={styles.tickerPrice}>₹2,150 / Qtl</span>
              </div>
              <div className={styles.tickerItem}>
                <span className={styles.tickerCrop}>🌾 Soybean (लातूर सोयाबीन)</span>
                <span className={styles.tickerPrice}>₹4,680 / Qtl</span>
              </div>
              <div className={styles.tickerItem}>
                <span className={styles.tickerCrop}>☁️ Cotton (जळगाव कापूस)</span>
                <span className={styles.tickerPrice}>₹7,350 / Qtl</span>
              </div>
              <div className={styles.tickerItem}>
                <span className={styles.tickerCrop}>🍅 Tomato (टोमॅटो क्रेट)</span>
                <span className={styles.tickerPrice}>₹320 / Crate</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
              <div className="neu-pill" style={{ flex: 1, justifyContent: "center" }}>
                <span>☀️</span> 32°C Nashik Clear
              </div>
              <div className="neu-pill" style={{ flex: 1, justifyContent: "center" }}>
                <span>💧</span> 90% Solar Grant
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            1-CLICK DEMO ACCOUNTS LAUNCHPAD FOR ALL ROLE TYPES
            ================================================================= */}
        <section className={styles.demoSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>⚡ Instant Experience</div>
            <h2 className={styles.sectionTitle}>
              {lang === "mr"
                ? "१-क्लिकमध्ये सर्व प्रकारच्या डेमो खात्यांचा अनुभव घ्या"
                : "1-Click Demo Accounts for All Personas"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {lang === "mr"
                ? "कोणतीही नोंदणी न करता शेतकरी, व्यापारी, मजूर, ट्रॅक्टर मालक व कृषी अधिकाऱ्यांच्या भूमिकेतून संपूर्ण प्लॅटफॉर्म तपासा."
                : "Experience the platform from any user perspective with preloaded realistic data and active simulated workflows."}
            </p>
          </div>

          <div className={styles.demoGrid}>
            {/* FARMER */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("FARMER")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.FARMER.avatarBg }}
                  >
                    {DEMO_PERSONAS.FARMER.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.FARMER.name}</h3>
                    <span className={styles.demoRoleTag}>
                      👨‍🌾 {DEMO_PERSONAS.FARMER.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.FARMER.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.FARMER.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Farmer Dashboard →
              </div>
            </div>

            {/* BUYER */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("BUYER")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.BUYER.avatarBg }}
                  >
                    {DEMO_PERSONAS.BUYER.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.BUYER.name}</h3>
                    <span className={styles.demoRoleTag}>
                      🛒 {DEMO_PERSONAS.BUYER.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.BUYER.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.BUYER.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Buyer Marketplace →
              </div>
            </div>

            {/* LABOUR */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("LABOUR")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.LABOUR.avatarBg }}
                  >
                    {DEMO_PERSONAS.LABOUR.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.LABOUR.name}</h3>
                    <span className={styles.demoRoleTag}>
                      👷‍♂️ {DEMO_PERSONAS.LABOUR.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.LABOUR.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.LABOUR.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Labour Profile →
              </div>
            </div>

            {/* TRACTOR OWNER */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("TRACTOR_OWNER")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.TRACTOR_OWNER.avatarBg }}
                  >
                    {DEMO_PERSONAS.TRACTOR_OWNER.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.TRACTOR_OWNER.name}</h3>
                    <span className={styles.demoRoleTag}>
                      🚜 {DEMO_PERSONAS.TRACTOR_OWNER.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.TRACTOR_OWNER.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.TRACTOR_OWNER.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Tractor Hub →
              </div>
            </div>

            {/* TRANSPORT PROVIDER */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("TRANSPORT_PROVIDER")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.TRANSPORT_PROVIDER.avatarBg }}
                  >
                    {DEMO_PERSONAS.TRANSPORT_PROVIDER.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.TRANSPORT_PROVIDER.name}</h3>
                    <span className={styles.demoRoleTag}>
                      🚚 {DEMO_PERSONAS.TRANSPORT_PROVIDER.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.TRANSPORT_PROVIDER.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.TRANSPORT_PROVIDER.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Transport Portal →
              </div>
            </div>

            {/* AGRI OFFICER / ADMIN */}
            <div
              className={styles.demoCard}
              onClick={() => handleDemoLaunch("ADMIN")}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className={styles.demoCardHeader}>
                  <div
                    className={styles.demoAvatar}
                    style={{ background: DEMO_PERSONAS.ADMIN.avatarBg }}
                  >
                    {DEMO_PERSONAS.ADMIN.avatarEmoji}
                  </div>
                  <div className={styles.demoPersonaInfo}>
                    <h3>{DEMO_PERSONAS.ADMIN.name}</h3>
                    <span className={styles.demoRoleTag}>
                      🛡️ {DEMO_PERSONAS.ADMIN.title}
                    </span>
                  </div>
                </div>

                <p className={styles.demoDescription}>
                  {DEMO_PERSONAS.ADMIN.description}
                </p>

                <div className={styles.demoStatsList}>
                  {DEMO_PERSONAS.ADMIN.keyStats.map((st, i) => (
                    <div key={i} className={styles.demoStatItem}>
                      <span className={styles.demoStatLabel}>{st.label}</span>
                      <span className={styles.demoStatVal}>{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.demoLaunchBtn}>
                Launch Admin Verification Portal →
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            FEATURE HIGHLIGHTS
            ================================================================= */}
        <section className={styles.featureSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>🌾 Complete Agri Suite</div>
            <h2 className={styles.sectionTitle}>
              {lang === "mr"
                ? "शेतकरी साथीची मुख्य वैशिष्ट्ये"
                : "Everything Built for the Modern Indian Farmer"}
            </h2>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>🏛️</div>
              <h3>90% Govt Schemes Hub</h3>
              <p>
                Apply directly for PM-KUSUM Solar Pumps, PM-KISAN ₹12,000 cash, PMFBY ₹1 Crop Insurance, and SMAM tractor grants with 1-click auto-fill.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>🌾</div>
              <h3>Kisan Sathi AI Chatbot</h3>
              <p>
                Multi-lingual intelligent crop doctor diagnosing pests, advising scientific fertilizer doses, and reading answers aloud via voice speech.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>🛒</div>
              <h3>0% Commission Marketplace</h3>
              <p>
                Connect directly with APMC wholesale buyers and supermarkets. Get transparent bidding and eliminate middleman deductions.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBox}>🚜</div>
              <h3>Tractor & Machinery Hub</h3>
              <p>
                Book verified tractors, rotavators, seed drills, and combine harvesters near your village with transparent hourly rates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
