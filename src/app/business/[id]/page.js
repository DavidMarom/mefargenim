"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/fb";
import { useUserStore } from "../../../store/userStore";
import Navbar from "../../../components/Navbar/Navbar";
import styles from "./page.module.css";

export default function BusinessDetail() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

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

  useEffect(() => {
    if (params?.id) {
      fetchBusiness();
    }
  }, [params]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/biz/${params.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBusiness(data.data);
      } else {
        console.error('Failed to fetch business:', data.error);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!params?.id) return;

    const url = `${window.location.origin}/business/${params.id}`;
    
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

  // Function to get display label for field names
  const getDisplayLabel = (key) => {
    if (key === 'title') {
      return 'שם העסק';
    }
    if (key === 'type') {
      return 'סוג העסק';
    }
    if (key === 'address') {
      return 'כתובת העסק';
    }
    if (key === 'phone') {
      return 'טלפון';
    }
    if (key === 'email') {
      return 'אימייל העסק';
    }
    if (key === 'city') {
      return 'עיר';
    }
    if (key === 'zip') {
      return 'מיקוד';
    }
    if (key === 'country') {
      return 'מדינה';
    }
    return key;
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

  if (!business) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <p>עסק לא נמצא</p>
        </main>
      </div>
    );
  }

  // Only show title, type, phone, and city
  const allowedFields = ['title', 'type', 'phone', 'city'];
  const entries = Object.entries(business).filter(([key]) => 
    allowedFields.includes(key)
  );
  
  // Sort entries to ensure correct order: title, type, phone, city
  entries.sort(([keyA], [keyB]) => {
    const order = ['title', 'type', 'phone', 'city'];
    return order.indexOf(keyA) - order.indexOf(keyB);
  });

  const businessUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/business/${params.id}` 
    : '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": business.title || "עסק",
            "description": `${business.type || ""} ${business.city ? `ב${business.city}` : ""}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": business.city || "",
              "addressCountry": "IL"
            },
            "telephone": business.phone || "",
            "url": businessUrl,
            ...(business.type && { "category": business.type })
          })
        }}
      />
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <h1>{business.title || 'פרטי העסק'}</h1>
        <div className={styles.businessDetails}>
          {entries.map(([key, value]) => {
            // Format the value for display
            let displayValue = value;
            if (value === null || value === undefined) {
              displayValue = 'לא זמין';
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            } else if (value instanceof Date) {
              displayValue = value.toLocaleDateString('he-IL');
            } else {
              displayValue = String(value);
            }

            return (
              <div key={key} className={styles.detailField}>
                <span className={styles.label}>{getDisplayLabel(key)}:</span>
                <span className={styles.value}>{displayValue}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button 
            onClick={handleShare}
            className={styles.shareButton}
          >
            {copied ? '✓ הועתק!' : 'שתף'}
          </button>
          <button 
            onClick={() => router.push('/dashboard')} 
            className={styles.backButton}
          >
            חזור
          </button>
        </div>
      </main>
    </div>
  );
}
