"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import { auth } from "../services/fb";
import { useUserStore } from "../store/userStore";
import BizCard from "../components/BizCard/BizCard";
import { useRecentBusinesses } from "../hooks/useRecentBusinesses";
import styles from "./page.module.css";
import GoogleLoginButton from "../components/GoogleLoginButton/GoogleLoginButton";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // Use React Query to fetch recent businesses (show 4 on login screen)
  const { data: recentBusinesses = [], isLoading: loadingBusinesses } = useRecentBusinesses(4);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // Save user to store and redirect to dashboard
        setUser(user);
        router.push("/dashboard");
      } else {
        clearUser();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setUser, clearUser]);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>טוען...</p>
        </main>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "מפרגנים",
            "description": "פלטפורמה לעסקים מקומיים",
            "url": baseUrl,
            "inLanguage": "he-IL",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/dashboard`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.logoContainer}>
            <Image
              src="/mlogo.png"
              alt="מפרגנים - פלטפורמה לעסקים מקומיים"
              width={200}
              height={200}
              className={styles.logo}
              priority
            />
          </div>

          <div className={styles.betaInfo}>
            <p>BETA</p>
            <p>מחוברים כרגע {Math.floor(Math.random() * 501) + 500}</p>
          </div>

          <GoogleLoginButton />

          {!loadingBusinesses && recentBusinesses.length > 0 && (
            <div className={styles.recentSection}>
              <h2 className={styles.recentTitle}>העסקים החדשים ביותר</h2>
              <div className={styles.cardsGrid}>
                {recentBusinesses.map((doc: any, index: number) => (
                  <BizCard key={doc._id?.toString() || index} document={doc} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

