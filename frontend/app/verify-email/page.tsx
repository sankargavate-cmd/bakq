"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/authApi";
import styles from "../auth/auth.module.css";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided. Check your email link.");
      return;
    }

    let isMounted = true;

    async function triggerVerification() {
      try {
        const result = await verifyEmail(token!);
        if (!isMounted) return;

        if (result.status === 200 && result.body.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(result.body.message || "Verification failed. The token may have expired.");
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage("Couldn't reach the server. Please check your internet connection.");
      }
    }

    triggerVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className={styles.card}>
      {status === "loading" && (
        <div className={styles.infoBanner}>
          Verifying your email address. Please wait...
        </div>
      )}

      {status === "success" && (
        <div className={styles.successState}>
          <div className={styles.infoBanner}>
            <strong>Success!</strong> Your email address has been verified successfully. You can now log in to your account.
          </div>
          <button
            type="button"
            className={styles.submitButton}
            onClick={() => router.push("/auth")}
          >
            Go to login
          </button>
        </div>
      )}

      {status === "error" && (
        <div className={styles.successState}>
          <div className={styles.formBanner}>
            <strong>Verification failed!</strong> {errorMessage}
          </div>
          <button
            type="button"
            className={styles.submitButton}
            onClick={() => router.push("/auth")}
          >
            Go to login / Sign up again
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Account Verification</div>
        <h1 className={styles.title}>Email Verification</h1>
        <Suspense fallback={<div className={styles.infoBanner}>Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
