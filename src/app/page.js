"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { auth } from "../services/fb";
import { useUserStore } from "../store/userStore";
import BizCard from "../components/BizCard/BizCard";
import styles from "./page.module.css";
import GoogleLoginButton from "../components/GoogleLoginButton/GoogleLoginButton";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Save user to store and redirect to dashboard
        setUser(user);
        router.push("/dashboard");
      } else {
        clearUser();
        setLoading(false);
        // Fetch recent businesses when user is not logged in
        fetchRecentBusinesses();
      }
    });

    return () => unsubscribe();
  }, [router, setUser, clearUser]);

  const fetchRecentBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const response = await fetch('/api/biz/recent?limit=3');
      const data = await response.json();

      if (data.success) {
        setRecentBusinesses(data.data || []);
      } else {
        console.error('Failed to fetch recent businesses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recent businesses:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>טוען...</p>
        </main>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

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
                "urlTemplate": `${baseUrl}/dashboard`
              },
              "query-input": "required name=search_term_string"
            }
          })
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
          
          <GoogleLoginButton />
          {!loadingBusinesses && recentBusinesses.length > 0 && (
            <div className={styles.recentSection}>
              <h2 className={styles.recentTitle}>העסקים החדשים ביותר</h2>
              <div className={styles.cardsGrid}>
                {recentBusinesses.map((doc, index) => (
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
