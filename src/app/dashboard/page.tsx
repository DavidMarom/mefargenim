"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import BizCard from "../../components/BizCard/BizCard";
import { businessTypes } from "../../data/businessTypes";
import { useBusinesses } from "../../hooks/useBusinesses";
import { handleShare } from "./utils";
import styles from "./page.module.css";
import type { BusinessDocument } from "../../components/BizCard/interfaces";

export default function Dashboard(): React.ReactElement | null {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [copied, setCopied] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [connectedCount] = useState<number>(() => 
    Math.floor(Math.random() * (1000 - 500 + 1)) + 500
  );
  const router = useRouter();
  const user = useUserStore((state) => state.user as FirebaseUser | null);
  const setUser = useUserStore((state) => state.setUser as (user: FirebaseUser) => void);
  const clearUser = useUserStore((state) => state.clearUser as () => void);

  // Use React Query to fetch businesses
  const {
    data: bizDocuments = [],
    isLoading: loadingBiz,
    error,
  } = useBusinesses();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        clearUser();
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser, clearUser]);

  const onShare = () => handleShare(setCopied);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <p>טוען...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const typedBizDocuments = bizDocuments as BusinessDocument[];

  // Get unique cities from businesses
  const uniqueCities = [...new Set(
    typedBizDocuments
      .map((doc) => doc.city)
      .filter((city): city is string => !!city && city.trim() !== "")
  )].sort();

  // Filter businesses by type and city
  const filteredDocuments = typedBizDocuments.filter((doc) => {
    const typeMatch = selectedType === "all" || doc.type === selectedType;
    const cityMatch = selectedCity === "all" || doc.city === selectedCity;
    return typeMatch && cityMatch;
  });

  const visibleDocuments = filteredDocuments.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pillarsContainer}>
          <div className={styles.connectedText}>
            מחוברים כרגע {connectedCount}
          </div>
          <div className={styles.quickFilterPillar}>
          <button
            onClick={() => setSelectedType("הפעלות")}
            className={styles.pillarButton}
          >
            הפעלות
          </button>
          <button
            onClick={() => setSelectedType("לק ג׳ל")}
            className={styles.pillarButton}
          >
            לק ג׳ל
          </button>
          <button
            onClick={() => setSelectedType("הנדי-מן")}
            className={styles.pillarButton}
          >
            הנדי-מן
          </button>
          <button
            onClick={() => setSelectedType("תוכן וסושיאל")}
            className={styles.pillarButton}
          >
            תוכן וסושיאל
          </button>
          </div>
        </div>

        <div className={styles.headerSection}>
          <h1>עסקים:</h1>
          <div className={styles.filtersContainer}>
            <div className={styles.filterSection}>
              <label htmlFor="typeFilter" className={styles.filterLabel}>
                סוג עסק:
              </label>
              <select
                id="typeFilter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">כל הסוגים</option>
                {businessTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterSection}>
              <label htmlFor="cityFilter" className={styles.filterLabel}>
                עיר:
              </label>
              <select
                id="cityFilter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">כל הערים</option>
                {uniqueCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loadingBiz ? (
          <p>טוען מסמכים...</p>
        ) : error ? (
          <p>שגיאה בטעינת העסקים. נסה שוב מאוחר יותר.</p>
        ) : filteredDocuments.length === 0 ? (
          <div className={styles.noResultsContainer}>
            <p className={styles.noDocuments}>
              אין לנו כאלה... שלח לבעלי עסקים והם יוכלו להיות הראשונים במערכת!
            </p>
            <button onClick={onShare} className={styles.shareButton}>
              {copied ? "✓ הועתק!" : "שתף את האתר"}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cardsGrid}>
              {visibleDocuments.map((doc, index) => (
                <BizCard
                  key={(doc._id as { toString(): string })?.toString() || index}
                  document={doc}
                />
              ))}
            </div>
            {filteredDocuments.length > visibleCount && (
              <div className={styles.loadMoreContainer}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                >
                  טען עוד
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

