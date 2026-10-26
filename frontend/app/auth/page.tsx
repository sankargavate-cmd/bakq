"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/auth";
import { loginAsDemoUser } from "@/lib/demoAccounts";
import {
  signInWithSupabase,
  signUpWithSupabase,
} from "@/lib/supabaseAuth";
import { getLanguageOption, getStoredLanguage, LanguageCode } from "@/lib/language";
import { Role } from "@/types";
import styles from "./auth.module.css";

type Mode = "login" | "signup";

interface RoleOption {
  value: Role;
  label: string;
  labelNative: string;
  emoji: string;
}

// Public registration roles — ADMIN and SUPER_ADMIN are excluded by security rule
const ROLE_OPTIONS: RoleOption[] = [
  { value: "FARMER", label: "Farmer", labelNative: "शेतकरी", emoji: "👨‍🌾" },
  { value: "BUYER", label: "Buyer", labelNative: "व्यापारी", emoji: "🛒" },
  { value: "LABOUR", label: "Labour", labelNative: "शेतमजूर", emoji: "👷‍♂️" },
  { value: "TRACTOR_OWNER", label: "Tractor Owner", labelNative: "ट्रॅक्टर मालक", emoji: "🚜" },
  { value: "TRANSPORT_PROVIDER", label: "Transport", labelNative: "मालवाहतूक", emoji: "🚚" },
  { value: "AUTHORIZED_PAYMENT_AGENT", label: "Payment Agent", labelNative: "अधिकृत प्रतिनिधी", emoji: "💼" },
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    setLanguage(getStoredLanguage() ?? "en");
  }, []);

  function handleQuickDemoLogin(role: Role) {
    loginAsDemoUser(role);
    const dest = getDashboardPathForRole(role);
    router.push(dest);
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>
          {language === "mr" ? "सुलभ शेतकरी प्रवेश · शेतकरी साथी" : "Easy Farmer Login · Shetkari Sathi"}
        </div>
        <h1 className={styles.title}>
          {mode === "login"
            ? language === "mr"
              ? "आपल्या खात्यात थेट प्रवेश करा"
              : "Simple & Fast Login"
            : language === "mr"
            ? "नवीन शेतकरी नोंदणी"
            : "Quick Account Setup"}
        </h1>

        <div className={styles.languageChip}>
          <span>🌐 {getLanguageOption(language).nativeLabel}</span>
          <button type="button" onClick={() => router.push("/")}>
            Change
          </button>
        </div>

        {/* 1-CLICK QUICK DEMO LOGIN BOX */}
        <div className={styles.demoLoginBox}>
          <div className={styles.demoLoginHeader}>
            <span className={styles.demoLoginTitle}>
              ⚡ 1-Click Instant Demo Login (थेट प्रवेश)
            </span>
            <span className="neu-badge-green">Instant Test</span>
          </div>

          <div className={styles.demoButtonsGrid}>
            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("FARMER")}
            >
              <span className={styles.demoBtnEmoji}>👨‍🌾</span>
              <span className={styles.demoBtnLabel}>Farmer</span>
              <span className={styles.demoBtnSub}>Ramesh Patil</span>
            </button>

            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("BUYER")}
            >
              <span className={styles.demoBtnEmoji}>🛒</span>
              <span className={styles.demoBtnLabel}>Buyer</span>
              <span className={styles.demoBtnSub}>APMC Trader</span>
            </button>

            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("LABOUR")}
            >
              <span className={styles.demoBtnEmoji}>👷‍♂️</span>
              <span className={styles.demoBtnLabel}>Labour</span>
              <span className={styles.demoBtnSub}>Sunil Shinde</span>
            </button>

            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("TRACTOR_OWNER")}
            >
              <span className={styles.demoBtnEmoji}>🚜</span>
              <span className={styles.demoBtnLabel}>Tractor Owner</span>
              <span className={styles.demoBtnSub}>Ganesh Krishi</span>
            </button>

            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("TRANSPORT_PROVIDER")}
            >
              <span className={styles.demoBtnEmoji}>🚚</span>
              <span className={styles.demoBtnLabel}>Transport</span>
              <span className={styles.demoBtnSub}>Maruti Agro</span>
            </button>

            <button
              type="button"
              className={styles.demoRoleBtn}
              onClick={() => handleQuickDemoLogin("ADMIN")}
            >
              <span className={styles.demoBtnEmoji}>🛡️</span>
              <span className={styles.demoBtnLabel}>Agri Officer</span>
              <span className={styles.demoBtnSub}>Dr. Deshmukh</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => setMode("login")}
          >
            {language === "mr" ? "लॉग इन (Login)" : "Log in"}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
            onClick={() => setMode("signup")}
          >
            {language === "mr" ? "नवीन नोंदणी (Sign up)" : "Sign up"}
          </button>
        </div>

        {/* Card Form */}
        <div className={styles.card}>
          {mode === "login" ? (
            <LoginForm
              language={language}
              onSwitchToSignup={() => setMode("signup")}
            />
          ) : (
            <SignupForm
              language={language}
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function LoginForm({
  language,
  onSwitchToSignup,
}: {
  language: LanguageCode;
  onSwitchToSignup: () => void;
}) {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input = phoneOrEmail.trim();
    const pass = password.trim();

    if (!input || !pass) {
      setError(
        language === "mr"
          ? "कृपया आपला मोबाईल नंबर किंवा ईमेल आणि पासवर्ड प्रविष्ट करा."
          : "Please enter your mobile number/email and password."
      );
      setSubmitting(false);
      return;
    }

    const result = await signInWithSupabase(input, pass);

    if (result.success && result.profile) {
      setSubmitting(false);
      const dest = getDashboardPathForRole(result.profile.role);
      router.push(dest);
      return;
    }

    setError(result.error || (language === "mr" ? "प्रवेश अयशस्वी झाला. कृपया पुन्हा प्रयत्न करा." : "Login failed. Please check your credentials."));
    setSubmitting(false);
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={styles.formBanner}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="login-phone">
            {language === "mr" ? "मोबाईल नंबर किंवा ईमेल" : "Mobile Number or Email"}
          </label>
          <input
            id="login-phone"
            type="text"
            required
            placeholder={
              language === "mr"
                ? "उदा. 9822012345 किंवा farmer@gmail.com"
                : "e.g. 9822012345 or farmer@gmail.com"
            }
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">Password / पासवर्ड</label>
          <div className={styles.passwordRow}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.toggleVisibility}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting
            ? language === "mr"
              ? "प्रवेश होत आहे..."
              : "Logging in…"
            : language === "mr"
            ? "थेट प्रवेश करा →"
            : "Log In Securely →"}
        </button>

        <button
          type="button"
          className={styles.linkButton}
          onClick={onSwitchToSignup}
        >
          {language === "mr"
            ? "नवीन खाते उघडायचे आहे? येथे नोंदणी करा"
            : "New here? Create your account in 10 seconds"}
        </button>
      </form>
    </div>
  );
}

function SignupForm({
  language,
  onSwitchToLogin,
}: {
  language: LanguageCode;
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FARMER");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const name = fullName.trim();
    const input = phoneOrEmail.trim();
    const pass = password.trim();

    if (!name) {
      setError(language === "mr" ? "कृपया आपले पूर्ण नाव प्रविष्ट करा." : "Please enter your full name.");
      setSubmitting(false);
      return;
    }

    if (!input) {
      setError(language === "mr" ? "कृपया आपला मोबाईल नंबर किंवा ईमेल प्रविष्ट करा." : "Please enter your mobile or email.");
      setSubmitting(false);
      return;
    }

    if (!pass || pass.length < 6) {
      setError(language === "mr" ? "पासवर्ड किमान ६ अक्षरांचा असावा." : "Password must be at least 6 characters.");
      setSubmitting(false);
      return;
    }

    const result = await signUpWithSupabase(
      input,
      pass,
      name,
      role,
      language
    );

    if (result.success && result.profile) {
      setSubmitting(false);
      if (result.sessionToken) {
        const dest = getDashboardPathForRole(result.profile.role);
        router.push(dest);
      } else {
        setSuccessMsg(
          language === "mr"
            ? "नोंदणी यशस्वी झाली! कृपया आपले खाते पडताळणी करा किंवा लॉग इन करा."
            : "Registration successful! Please log in with your credentials."
        );
      }
      return;
    }

    setError(result.error || (language === "mr" ? "नोंदणी पूर्ण होऊ शकली नाही." : "Registration failed."));
    setSubmitting(false);
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={styles.formBanner}>{error}</div>}
        {successMsg && <div className="neu-badge-green" style={{ padding: "10px", marginBottom: "15px", display: "block", textAlign: "center" }}>{successMsg}</div>}

        {/* Visual Role Selector */}
        <div className={styles.field}>
          <label>{language === "mr" ? "माझी भूमिका निवडा:" : "Choose Your Role:"}</label>
          <div className={styles.roleSelectorGrid}>
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = role === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`${styles.roleOptionCard} ${
                    isSelected ? styles.roleOptionCardActive : ""
                  }`}
                  onClick={() => setRole(opt.value)}
                  role="button"
                  tabIndex={0}
                >
                  <span className={styles.roleCardEmoji}>{opt.emoji}</span>
                  <span className={styles.roleCardLabel}>{opt.label}</span>
                  <span className={styles.roleCardNative}>{opt.labelNative}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-name">
            {language === "mr" ? "पूर्ण नाव (Full Name)" : "Full Name"}
          </label>
          <input
            id="signup-name"
            type="text"
            required
            placeholder={
              language === "mr"
                ? "उदा. रमेश ज्ञानेश्वर पाटील"
                : "e.g. Ramesh Dnyaneshwar Patil"
            }
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-phone">
            {language === "mr" ? "मोबाईल नंबर किंवा ईमेल" : "Mobile Number or Email"}
          </label>
          <input
            id="signup-phone"
            type="text"
            required
            placeholder={
              language === "mr"
                ? "उदा. 9822012345 किंवा ramesh@gmail.com"
                : "e.g. 9822012345 or ramesh@gmail.com"
            }
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-password">Password / पासवर्ड (किमान ६ अक्षरे)</label>
          <div className={styles.passwordRow}>
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.toggleVisibility}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting
            ? language === "mr"
              ? "नोंदणी होत आहे..."
              : "Registering with Supabase…"
            : language === "mr"
            ? "खाते उघडा व सुरू करा →"
            : "Complete Setup & Launch →"}
        </button>

        <button
          type="button"
          className={styles.linkButton}
          onClick={onSwitchToLogin}
        >
          {language === "mr"
            ? "आधीच खाते आहे? येथे थेट प्रवेश करा"
            : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
