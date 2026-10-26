"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getDashboardPathForRole, getStoredRole, getStoredToken } from "@/lib/auth";
import { signOutWithSupabase } from "@/lib/supabaseAuth";
import {
  DEMO_PERSONAS,
  getCurrentDemoPersona,
  loginAsDemoUser,
} from "@/lib/demoAccounts";
import {
  getLanguageOption,
  getStoredLanguage,
  LANGUAGES,
  LanguageCode,
  setStoredLanguage,
} from "@/lib/language";
import { Role } from "@/types";
import styles from "./navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setToken(getStoredToken());
    setRole(getStoredRole());
    setLanguage(getStoredLanguage() || "en");

    function handleClickOutside(e: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaOpen(false);
        setIsLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname]);

  function handleSwitchPersona(targetRole: Role) {
    loginAsDemoUser(targetRole);
    setRole(targetRole);
    setToken(getStoredToken());
    setIsPersonaOpen(false);
    const dest = getDashboardPathForRole(targetRole);
    router.push(dest);
  }

  function handleLanguageChange(code: LanguageCode) {
    setStoredLanguage(code);
    setLanguage(code);
    setIsLangOpen(false);
    window.location.reload();
  }

  async function handleLogout() {
    await signOutWithSupabase();
    clearStoredToken();
    setToken(null);
    setRole(null);
    router.push("/auth");
  }

  const currentPersona = mounted
    ? getCurrentDemoPersona() || (role ? DEMO_PERSONAS[role as Role] : null)
    : null;
  const dashboardHref = getDashboardPathForRole(role);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand */}
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21V11" />
              <path d="M12 11c0-4 3-6.5 7-6.5-.3 4-3 6.5-7 6.5Z" />
              <path d="M12 14c0-3.2-2.4-5.5-6-5.5.3 3.2 2.4 5.5 6 5.5Z" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Shetkari Sathi</span>
            <span className={styles.brandTitleNative}>शेतकरी साथी</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
          >
            Home
          </Link>
          <Link
            href="/schemes"
            className={`${styles.navLink} ${
              pathname.startsWith("/schemes") ? styles.navLinkActive : ""
            }`}
          >
            <span>Govt Schemes</span>
            <span className={styles.navBadge}>90% Subsidy</span>
          </Link>
          <Link
            href="/buyer/marketplace"
            className={`${styles.navLink} ${
              pathname.startsWith("/buyer/marketplace") ? styles.navLinkActive : ""
            }`}
          >
            Marketplace
          </Link>
          {mounted && token && (
            <Link
              href={dashboardHref}
              className={`${styles.navLink} ${
                pathname.includes("/dashboard") ? styles.navLinkActive : ""
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Controls */}
        <div className={styles.navControls} ref={personaRef}>
          {/* 1-Click Role Switcher */}
          <div className={styles.roleSelectorWrapper}>
            <button
              type="button"
              className={styles.personaTrigger}
              onClick={() => {
                setIsPersonaOpen((prev) => !prev);
                setIsLangOpen(false);
              }}
              title="Click to Switch Demo Persona"
            >
              <div
                className={styles.personaAvatar}
                style={{
                  background: currentPersona?.avatarBg || "var(--green-700)",
                  color: "white",
                }}
              >
                {currentPersona?.avatarEmoji || "⚡"}
              </div>
              <span className={styles.personaLabel}>
                {currentPersona ? currentPersona.name.split(" ")[0] : "Demo Personas"}
              </span>
              <span className={styles.roleTag}>
                {currentPersona ? currentPersona.role.replace("_", " ") : "Switch"}
              </span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Persona Dropdown Menu */}
            {isPersonaOpen && (
              <div className={styles.personaDropdown}>
                <div className={styles.dropdownTitle}>
                  ⚡ 1-Click Persona Fast Switcher
                </div>

                {Object.values(DEMO_PERSONAS).map((p) => {
                  const isActive = role === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      className={`${styles.personaOption} ${
                        isActive ? styles.personaOptionActive : ""
                      }`}
                      onClick={() => handleSwitchPersona(p.role)}
                    >
                      <div
                        className={styles.optionAvatar}
                        style={{ background: p.avatarBg, color: "white" }}
                      >
                        {p.avatarEmoji}
                      </div>
                      <div className={styles.optionBody}>
                        <span className={styles.optionName}>
                          {p.name} {p.nameMr ? `(${p.nameMr})` : ""}
                        </span>
                        <span className={styles.optionDesc}>{p.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.langSelectBtn}
              onClick={() => {
                setIsLangOpen((prev) => !prev);
                setIsPersonaOpen(false);
              }}
            >
              <span>🌐</span>
              <span>{getLanguageOption(language).nativeLabel}</span>
            </button>

            {isLangOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  right: 0,
                  background: "var(--bg-primary)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--neu-flat)",
                  border: "1px solid rgba(255, 255, 255, 0.9)",
                  padding: "0.5rem",
                  zIndex: 950,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  minWidth: "140px",
                }}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "left",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: language === l.code ? "var(--green-700)" : "var(--ink-700)",
                      background: language === l.code ? "var(--green-50)" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => handleLanguageChange(l.code)}
                  >
                    {l.nativeLabel} ({l.label})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Action */}
          {mounted && token ? (
            <button
              type="button"
              className="neu-button"
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            <Link href="/auth" className={styles.authBtn}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
