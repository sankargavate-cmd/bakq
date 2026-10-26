"use client";

import { useEffect, useState } from "react";
import { getStoredLanguage, LanguageCode } from "@/lib/language";
import { getCurrentDemoPersona } from "@/lib/demoAccounts";
import {
  GOVT_SCHEMES,
  GovtScheme,
  INITIAL_DEMO_APPLICATIONS,
  SchemeApplication,
  SchemeCategory,
} from "@/lib/schemesData";
import { supabase } from "@/lib/supabase";
import styles from "./schemes.module.css";

type Tab = "catalog" | "calculator" | "tracking";

export default function SchemesPage() {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>("all");

  // Application Modal state
  const [activeScheme, setActiveScheme] = useState<GovtScheme | null>(null);
  const [appStep, setAppStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [applicantForm, setApplicantForm] = useState({
    name: "Ramesh Dnyaneshwar Patil",
    phone: "+91 98220 12345",
    aadhaar: "4589-2180-8921",
    landAcres: "5.2",
    surveyNumber: "Gat No. 142/2",
    village: "Dindori",
    district: "Nashik",
  });
  const [attachedDocs, setAttachedDocs] = useState<Record<string, boolean>>({
    aadhaar: true,
    landRecord: true,
    bankPassbook: true,
    declaration: true,
  });

  // Tracked Applications state (persisted in session)
  const [applications, setApplications] = useState<SchemeApplication[]>(INITIAL_DEMO_APPLICATIONS);
  const [submittedApp, setSubmittedApp] = useState<SchemeApplication | null>(null);

  // Eligibility Calculator state
  const [calcLand, setCalcLand] = useState("5");
  const [calcWater, setCalcWater] = useState("well");
  const [calcCrop, setCalcCrop] = useState("cotton");

  useEffect(() => {
    const storedLang = getStoredLanguage() || "en";
    setLang(storedLang);

    const demoUser = getCurrentDemoPersona();
    if (demoUser) {
      setApplicantForm((prev) => ({
        ...prev,
        name: demoUser.name,
        phone: demoUser.phone,
      }));
    }
  }, []);

  const filteredSchemes = GOVT_SCHEMES.filter((scheme) => {
    const matchesCategory =
      selectedCategory === "all" || scheme.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      scheme.title.toLowerCase().includes(q) ||
      scheme.titleMr.toLowerCase().includes(q) ||
      scheme.description.toLowerCase().includes(q) ||
      scheme.shortCode.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  function openApplyModal(scheme: GovtScheme) {
    setActiveScheme(scheme);
    setSelectedOption(scheme.options?.[0]?.value || "");
    setAppStep(1);
    setSubmittedApp(null);
  }

  function handleAutoFill() {
    setApplicantForm({
      name: "Ramesh Dnyaneshwar Patil",
      phone: "+91 98220 12345",
      aadhaar: "4589-2180-8921",
      landAcres: "5.2",
      surveyNumber: "Gat No. 142/2",
      village: "Dindori",
      district: "Nashik",
    });
    setAttachedDocs({
      aadhaar: true,
      landRecord: true,
      bankPassbook: true,
      declaration: true,
    });
  }

  function handleFinalSubmit() {
    if (!activeScheme) return;

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const newAppId = `MH-${activeScheme.shortCode}-${new Date().getFullYear()}-${randomIdNum}`;

    const newApplication: SchemeApplication = {
      applicationId: newAppId,
      schemeId: activeScheme.id,
      schemeTitle: activeScheme.title,
      applicantName: applicantForm.name,
      applicantPhone: applicantForm.phone,
      aadhaarNumber: `XXXX-XXXX-${applicantForm.aadhaar.slice(-4) || "8921"}`,
      landAcres: `${applicantForm.landAcres} Acres`,
      village: applicantForm.village,
      district: applicantForm.district,
      surveyNumber: applicantForm.surveyNumber,
      selectedOption:
        activeScheme.options?.find((o) => o.value === selectedOption)?.label ||
        "Standard Application",
      appliedDate: new Date().toISOString().split("T")[0],
      status: "submitted",
      currentStage: 1,
      statusNotes:
        "Application received successfully by Taluka Agriculture Office. Digital 7/12 verification initiated.",
    };

    setApplications((prev) => [newApplication, ...prev]);
    setSubmittedApp(newApplication);
    setAppStep(4);

    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem("shetkari-sathi:scheme-applications");
      const list = stored ? JSON.parse(stored) : [];
      window.sessionStorage.setItem("shetkari-sathi:scheme-applications", JSON.stringify([newApplication, ...list]));
    }
  }

  // Calculate estimated eligible subsidies
  const landNum = parseFloat(calcLand) || 0;
  const estimatedSolarSubsidy = landNum >= 1 ? 210000 : 0;
  const pmKisanBenefit = 12000;
  const cropInsuranceBenefit = Math.round(landNum * 42000);
  const totalEligibleSubsidy =
    estimatedSolarSubsidy + pmKisanBenefit + cropInsuranceBenefit;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroBanner}>
          <div className={styles.heroEyebrow}>
            <span>🏛️</span>
            <span>
              {lang === "mr" ? "शासकीय योजना दालन" : "Government Schemes Portal"}
            </span>
          </div>
          <h1 className={styles.heroTitle}>
            {lang === "mr"
              ? "शेतकऱ्यांसाठी सर्व सरकारी योजना — १-क्लिकमध्ये थेट अर्ज करा"
              : "Empowering Farmers with 100% Verified Government Schemes & Subsidies"}
          </h1>
          <p className={styles.heroSubtitle}>
            {lang === "mr"
              ? "पीएम-कुसुम सौर पंप, पीएम किसान ₹१२,०००, ₹१ पीक विमा, ट्रॅक्टर अनुदान व शेततळे योजनांची संपूर्ण माहिती व थेट ऑनलाइन अर्ज."
              : "Direct access to central and Maharashtra state agricultural subsidies, 90% solar pump grants, ₹12,000 cash support, and instant application tracking."}
          </p>

          <div className={styles.heroStatsRow}>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatVal}>90%</span>
              <span className={styles.heroStatLabel}>
                {lang === "mr" ? "सौर पंप अनुदान" : "Solar Pump Subsidy"}
              </span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatVal}>₹12,000 / yr</span>
              <span className={styles.heroStatLabel}>
                {lang === "mr" ? "पीएम-किसान + नमो शेतकरी" : "Direct Cash Support"}
              </span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatVal}>₹1 Token</span>
              <span className={styles.heroStatLabel}>
                {lang === "mr" ? "पीक विमा संरक्षण" : "Crop Insurance Cover"}
              </span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatVal}>50% Grant</span>
              <span className={styles.heroStatLabel}>
                {lang === "mr" ? "ट्रॅक्टर व अवजारे" : "Farm Machinery"}
              </span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className={styles.tabBar} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "catalog" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("catalog")}
          >
            <span>📜</span>
            <span>{lang === "mr" ? "सर्व योजना पहा" : "Browse All Schemes"}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "calculator" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("calculator")}
          >
            <span>🧮</span>
            <span>
              {lang === "mr" ? "पात्रता व अनुदान कॅल्क्युलेटर" : "Subsidy Calculator"}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "tracking" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("tracking")}
          >
            <span>📍</span>
            <span>
              {lang === "mr"
                ? `माझे अर्ज व स्थिती (${applications.length})`
                : `My Applications (${applications.length})`}
            </span>
          </button>
        </div>

        {/* =================================================================
            TAB 1: BROWSE SCHEMES CATALOG
            ================================================================= */}
        {activeTab === "catalog" && (
          <div>
            <div className={styles.filterSection}>
              <div className={styles.searchBarWrapper}>
                <svg
                  className={styles.searchIcon}
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={
                    lang === "mr"
                      ? "योजना शोधा (उदा. सौर पंप, पीएम किसान, पीक विमा, ट्रॅक्टर)..."
                      : "Search schemes (e.g. Solar pump, PM Kisan, Insurance, Tractor)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className={styles.categoryPills}>
                {[
                  { id: "all", label: "All Schemes", labelMr: "सर्व योजना" },
                  { id: "solar", label: "☀️ Solar Pumps (90%)", labelMr: "☀️ सौर पंप (९०%)" },
                  { id: "grant", label: "💵 Direct Cash Support", labelMr: "💵 रोख मदत (₹१२,०००)" },
                  { id: "insurance", label: "🛡️ Crop Insurance", labelMr: "🛡️ पीक विमा (₹१)" },
                  { id: "machinery", label: "🚜 Farm Machinery", labelMr: "🚜 ट्रॅक्टर व यंत्रे" },
                  { id: "water", label: "💧 Farm Ponds", labelMr: "💧 शेततळे अनुदान" },
                  { id: "loan", label: "💳 4% Crop Loans", labelMr: "💳 सवलत पीक कर्ज" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryPill} ${
                      selectedCategory === cat.id ? styles.categoryPillActive : ""
                    }`}
                    onClick={() => setSelectedCategory(cat.id as SchemeCategory)}
                  >
                    {lang === "mr" ? cat.labelMr : cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.schemesGrid}>
              {filteredSchemes.map((scheme) => (
                <div key={scheme.id} className={styles.schemeCard}>
                  <div>
                    <div className={styles.cardTopRow}>
                      <div className={styles.schemeIconWrapper}>{scheme.icon}</div>
                      <span className={styles.authorityBadge}>
                        {lang === "mr" ? scheme.authorityMr : scheme.authority}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.schemeTitle}>{scheme.title}</h3>
                      <span className={styles.schemeTitleNative}>{scheme.titleMr}</span>
                      <p className={styles.schemeDesc}>
                        {lang === "mr" ? scheme.descriptionMr : scheme.description}
                      </p>

                      <div className={styles.benefitHighlights}>
                        <div className={styles.highlightItem}>
                          <span className={styles.highlightLabel}>Subsidy Benefit</span>
                          <span className={styles.highlightVal}>{scheme.subsidyPercent}</span>
                        </div>
                        <div className={styles.highlightItem}>
                          <span className={styles.highlightLabel}>Max Grant</span>
                          <span className={styles.highlightVal}>{scheme.maxBenefit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={() => openApplyModal(scheme)}
                    >
                      ⚡ {lang === "mr" ? "१-क्लिक अर्ज करा" : "Apply in 1-Click"}
                    </button>
                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() => openApplyModal(scheme)}
                    >
                      {lang === "mr" ? "तपशील" : "Details"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: SMART ELIGIBILITY & SUBSIDY CALCULATOR
            ================================================================= */}
        {activeTab === "calculator" && (
          <div className={styles.calculatorCard}>
            <div className={styles.calcHeader}>
              <h2 className={styles.calcTitle}>
                {lang === "mr"
                  ? "🌾 शेतकरी पात्रता व अनुदान कॅल्क्युलेटर"
                  : "🌾 Smart Subsidy & Eligibility Calculator"}
              </h2>
              <p className={styles.calcSubtitle}>
                {lang === "mr"
                  ? "आपली जमीन व पिकांची माहिती निवडून पात्र असलेले शासकीय अनुदान त्वरित तपासा."
                  : "Select your land size and irrigation source to calculate total government financial benefits."}
              </p>
            </div>

            <div className={styles.calcFormGrid}>
              <div className={styles.calcFormGroup}>
                <label>
                  {lang === "mr" ? "शेतजमीन (एकरमध्ये)" : "Land Holding (In Acres)"}
                </label>
                <select
                  className={styles.calcSelect}
                  value={calcLand}
                  onChange={(e) => setCalcLand(e.target.value)}
                >
                  <option value="1">1 to 2 Acres (Small Farmer)</option>
                  <option value="3">3 to 5 Acres (Medium Farmer)</option>
                  <option value="5">5 to 10 Acres (Progressive Farmer)</option>
                  <option value="12">Above 10 Acres</option>
                </select>
              </div>

              <div className={styles.calcFormGroup}>
                <label>
                  {lang === "mr" ? "पाण्याचा मुख्य स्रोत" : "Irrigation Water Source"}
                </label>
                <select
                  className={styles.calcSelect}
                  value={calcWater}
                  onChange={(e) => setCalcWater(e.target.value)}
                >
                  <option value="well">Open Well / विहीर</option>
                  <option value="borewell">Borewell / कूपनलिका</option>
                  <option value="pond">Farm Pond / शेततळे</option>
                  <option value="rainfed">Rainfed / कोरडवाहू</option>
                </select>
              </div>

              <div className={styles.calcFormGroup}>
                <label>
                  {lang === "mr" ? "मुख्य पीक" : "Primary Crop Grown"}
                </label>
                <select
                  className={styles.calcSelect}
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                >
                  <option value="cotton">Cotton / कापूस</option>
                  <option value="soybean">Soybean / सोयाबीन</option>
                  <option value="sugarcane">Sugarcane / ऊस</option>
                  <option value="onion">Onion / कांदा</option>
                  <option value="wheat">Wheat / गहू</option>
                </select>
              </div>
            </div>

            <div className={styles.calcResultBox}>
              <h3 className={styles.resultTitle}>
                🎉 {lang === "mr" ? "अभिनंदन! आपण पात्र असलेले अंदाजित अनुदान:" : "Congratulations! Estimated Total Eligible Subsidy:"}
              </h3>
              <div className={styles.resultAmount}>
                ₹{totalEligibleSubsidy.toLocaleString("en-IN")}
              </div>

              <div className={styles.eligibleSchemesList}>
                <div className={styles.eligibleSchemeItem}>
                  <div>
                    <h4>☀️ PM-KUSUM 90% Solar Agricultural Pump</h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-500)" }}>
                      Eligible for 5 HP Solar DC Submersible pump with 90% state + central subsidy
                    </p>
                  </div>
                  <span>₹2,10,000 Grant</span>
                </div>

                <div className={styles.eligibleSchemeItem}>
                  <div>
                    <h4>🏛️ PM-KISAN + Namo Shetkari Yojana</h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-500)" }}>
                      ₹6,000 Central + ₹6,000 Maharashtra State annual direct income support
                    </p>
                  </div>
                  <span>₹12,000 / yr</span>
                </div>

                <div className={styles.eligibleSchemeItem}>
                  <div>
                    <h4>🛡️ PMFBY Crop Loss Insurance Cover</h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-500)" }}>
                      Comprehensive weather & natural calamity insurance cover for {calcLand} Acres
                    </p>
                  </div>
                  <span>₹{cropInsuranceBenefit.toLocaleString("en-IN")} Cover</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.applyBtn}
                style={{ maxWidth: "320px", display: "inline-block" }}
                onClick={() => {
                  const kusum = GOVT_SCHEMES.find((s) => s.id === "pm-kusum");
                  if (kusum) openApplyModal(kusum);
                }}
              >
                ⚡ {lang === "mr" ? "सौर पंप योजनेसाठी थेट अर्ज करा" : "Apply for Eligible Schemes Now"}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: MY APPLICATIONS & LIVE TRACKING
            ================================================================= */}
        {activeTab === "tracking" && (
          <div className={styles.applicationsContainer}>
            {applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-primary)", borderRadius: "var(--radius-lg)", boxShadow: "var(--neu-flat)" }}>
                <p>You haven&apos;t submitted any scheme applications yet.</p>
              </div>
            ) : (
              applications.map((app) => {
                const stages = [
                  "1. Applied",
                  "2. Doc Verification",
                  "3. Field Inspection",
                  "4. Sanctioned",
                  "5. Disbursed",
                ];

                return (
                  <div key={app.applicationId} className={styles.appTrackerCard}>
                    <div className={styles.appTrackerHeader}>
                      <div>
                        <span className={styles.appIdBadge}>ID: {app.applicationId}</span>
                        <h3 className={styles.appSchemeName}>{app.schemeTitle}</h3>
                        <p style={{ fontSize: "0.82rem", color: "var(--ink-500)", marginTop: "0.2rem" }}>
                          Applicant: <strong>{app.applicantName}</strong> · Land: {app.landAcres} ({app.surveyNumber}, {app.village}, {app.district}) · Applied on {app.appliedDate}
                        </p>
                      </div>
                      <span
                        className={`${styles.appStatusBadge} ${
                          app.status === "disbursed"
                            ? styles.statusDisbursed
                            : app.status === "approved"
                            ? styles.statusApproved
                            : styles.statusVerification
                        }`}
                      >
                        {app.status === "disbursed"
                          ? "✓ Subsidy Disbursed"
                          : app.status === "approved"
                          ? "★ Sanction Approved"
                          : "⏳ In Verification"}
                      </span>
                    </div>

                    {/* Multi-Stage Visual Timeline */}
                    <div className={styles.timeline}>
                      <div
                        className={styles.timelineProgress}
                        style={{
                          width: `${((app.currentStage - 1) / (stages.length - 1)) * 100}%`,
                        }}
                      />
                      {stages.map((stg, idx) => {
                        const stageNum = idx + 1;
                        const isDone = stageNum <= app.currentStage;
                        return (
                          <div key={stg} className={styles.timelineStep}>
                            <div
                              className={`${styles.stepDot} ${
                                isDone ? styles.stepDotActive : ""
                              }`}
                            >
                              {isDone ? "✓" : stageNum}
                            </div>
                            <span
                              className={`${styles.stepLabel} ${
                                isDone ? styles.stepLabelActive : ""
                              }`}
                            >
                              {stg}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.appNotesBox}>
                      <strong>Officer Status Note: </strong>
                      {app.statusNotes}
                      {app.disbursedAmount && (
                        <div style={{ marginTop: "0.4rem", color: "var(--green-800)", fontWeight: 700 }}>
                          💰 {app.disbursedAmount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =================================================================
            MULTI-STEP APPLICATION MODAL
            ================================================================= */}
        {activeScheme && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>{activeScheme.title}</h2>
                  <span style={{ fontSize: "0.78rem", color: "var(--green-700)", fontWeight: 600 }}>
                    {activeScheme.subsidyPercent} · {activeScheme.authority}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScheme(null)}
                  style={{ fontSize: "1.4rem", cursor: "pointer", color: "var(--ink-500)" }}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Step Bar */}
                {appStep < 4 && (
                  <div className={styles.stepIndicator}>
                    <div
                      className={`${styles.stepItem} ${
                        appStep >= 1 ? styles.stepItemActive : ""
                      }`}
                    >
                      <span className={styles.stepNum}>1</span>
                      <span>Farmer & Land</span>
                    </div>
                    <div
                      className={`${styles.stepItem} ${
                        appStep >= 2 ? styles.stepItemActive : ""
                      }`}
                    >
                      <span className={styles.stepNum}>2</span>
                      <span>Scheme Option</span>
                    </div>
                    <div
                      className={`${styles.stepItem} ${
                        appStep >= 3 ? styles.stepItemActive : ""
                      }`}
                    >
                      <span className={styles.stepNum}>3</span>
                      <span>Documents</span>
                    </div>
                  </div>
                )}

                {/* STEP 1: FARMER & LAND DETAILS */}
                {appStep === 1 && (
                  <div>
                    <div className={styles.autoFillBar}>
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "var(--green-900)" }}>
                          ⚡ Instant Auto-Fill
                        </strong>
                        <p style={{ fontSize: "0.75rem", color: "var(--ink-500)" }}>
                          Use verified profile & 7/12 land record
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.autoFillBtn}
                        onClick={handleAutoFill}
                      >
                        Auto-Fill Details
                      </button>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Farmer Full Name (7/12 प्रमाणे नाव)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={applicantForm.name}
                          onChange={(e) =>
                            setApplicantForm({ ...applicantForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mobile Number (मोबाईल)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={applicantForm.phone}
                          onChange={(e) =>
                            setApplicantForm({ ...applicantForm, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Aadhaar Number (आधार कार्ड)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={applicantForm.aadhaar}
                          onChange={(e) =>
                            setApplicantForm({ ...applicantForm, aadhaar: e.target.value })
                          }
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Land Holding (एकर शेती)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={applicantForm.landAcres}
                          onChange={(e) =>
                            setApplicantForm({ ...applicantForm, landAcres: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Survey / Gat Number (गट क्र.)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={applicantForm.surveyNumber}
                          onChange={(e) =>
                            setApplicantForm({ ...applicantForm, surveyNumber: e.target.value })
                          }
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Village & District (गाव व जिल्हा)</label>
                        <input
                          type="text"
                          className="neu-input"
                          value={`${applicantForm.village}, ${applicantForm.district}`}
                          onChange={(e) => {
                            const [v, d] = e.target.value.split(",");
                            setApplicantForm({
                              ...applicantForm,
                              village: v?.trim() || applicantForm.village,
                              district: d?.trim() || applicantForm.district,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SCHEME SPECIFIC OPTIONS */}
                {appStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      {activeScheme.optionsLabel || "Choose Scheme Specification"}
                    </h3>

                    {activeScheme.options && activeScheme.options.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {activeScheme.options.map((opt) => (
                          <label
                            key={opt.value}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              padding: "0.85rem 1rem",
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-primary)",
                              boxShadow:
                                selectedOption === opt.value
                                  ? "var(--neu-pressed-sm)"
                                  : "var(--neu-flat-sm)",
                              border:
                                selectedOption === opt.value
                                  ? "1.5px solid var(--green-600)"
                                  : "1px solid rgba(255, 255, 255, 0.8)",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name="schemeOption"
                              checked={selectedOption === opt.value}
                              onChange={() => setSelectedOption(opt.value)}
                            />
                            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "1rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--neu-inset)" }}>
                        <p style={{ fontSize: "0.88rem", color: "var(--ink-700)" }}>
                          Standard enrollment for <strong>{activeScheme.title}</strong> will be processed under your 7/12 land account.
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: "1.5rem" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--green-900)", marginBottom: "0.4rem" }}>
                        Eligibility Check Confirmation:
                      </h4>
                      <ul style={{ paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--ink-700)", lineHeight: 1.6 }}>
                        {activeScheme.eligibility.map((el, i) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* STEP 3: DOCUMENT ATTACHMENTS */}
                {appStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      Required Document Checklist
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--ink-500)", marginBottom: "1rem" }}>
                      Files have been automatically attached from your verified Shetkari Sathi digital locker.
                    </p>

                    <div className={styles.docUploadGrid}>
                      {activeScheme.requiredDocs.map((doc, idx) => (
                        <div key={idx} className={styles.docItem}>
                          <div className={styles.docInfo}>
                            <h4>{doc.name}</h4>
                            <p>{doc.nameMr}</p>
                          </div>
                          <span className={styles.docAttachedBadge}>
                            ✓ Attached (Digital Verified)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: SUCCESS CONFIRMATION & RECEIPT */}
                {appStep === 4 && submittedApp && (
                  <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h3 className={styles.successTitle}>Application Submitted Successfully!</h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--green-800)", fontWeight: 600 }}>
                      आपला अर्ज शासकीय कृषी विभागाकडे पाठवण्यात आला आहे.
                    </p>

                    <div className={styles.ackReceipt}>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Application ID:</span>
                        <span className={styles.receiptValue}>{submittedApp.applicationId}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Scheme Name:</span>
                        <span className={styles.receiptValue}>{submittedApp.schemeTitle}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Applicant Name:</span>
                        <span className={styles.receiptValue}>{submittedApp.applicantName}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Land / Village:</span>
                        <span className={styles.receiptValue}>
                          {submittedApp.landAcres} · {submittedApp.village}, {submittedApp.district}
                        </span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Submission Date:</span>
                        <span className={styles.receiptValue}>{submittedApp.appliedDate}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Current Status:</span>
                        <span className={styles.receiptValue} style={{ color: "var(--green-700)" }}>
                          Under Verification (Stage 1 of 5)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="neu-button neu-button-primary"
                      onClick={() => {
                        setActiveScheme(null);
                        setActiveTab("tracking");
                      }}
                    >
                      Track Application Status
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              {appStep < 4 && (
                <div className={styles.modalFooter}>
                  {appStep > 1 ? (
                    <button
                      type="button"
                      className="neu-button"
                      onClick={() => setAppStep((prev) => ((prev - 1) as 1 | 2 | 3))}
                    >
                      ← Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="neu-button"
                      onClick={() => setActiveScheme(null)}
                    >
                      Cancel
                    </button>
                  )}

                  {appStep < 3 ? (
                    <button
                      type="button"
                      className="neu-button neu-button-primary"
                      onClick={() => setAppStep((prev) => ((prev + 1) as 2 | 3))}
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="neu-button neu-button-primary"
                      onClick={handleFinalSubmit}
                    >
                      ✓ Submit Application Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
