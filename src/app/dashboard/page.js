"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import BizCard from "../../components/BizCard/BizCard";
import { businessTypes } from "../../data/businessTypes";
import { useBusinesses } from "../../hooks/useBusinesses";
import styles from "./page.module.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  
  // Use React Query to fetch businesses
  const { data: bizDocuments = [], isLoading: loadingBiz, error } = useBusinesses();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Update store with latest user data
        setUser(firebaseUser);
      } else {
        clearUser();
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser, clearUser]);

  const handleShare = async () => {
    const url = window.location.origin;
    
    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      // Open WhatsApp web with the URL
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: try to open WhatsApp directly
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

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

  // Get unique cities from businesses
  const uniqueCities = [...new Set(bizDocuments
    .map(doc => doc.city)
    .filter(city => city && city.trim() !== '')
  )].sort();

  // Filter businesses by type and city
  const filteredDocuments = bizDocuments.filter(doc => {
    const typeMatch = selectedType === "all" || doc.type === selectedType;
    const cityMatch = selectedCity === "all" || doc.city === selectedCity;
    return typeMatch && cityMatch;
  });

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
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
            <p className={styles.noDocuments}>אין לנו כאלה... שלח לבעלי עסקים והם יוכלו להיות הראשונים במערכת!</p>
            <button 
              onClick={handleShare}
              className={styles.shareButton}
            >
              {copied ? '✓ הועתק!' : 'שתף את האתר'}
            </button>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredDocuments.map((doc, index) => (
              <BizCard key={doc._id?.toString() || index} document={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
