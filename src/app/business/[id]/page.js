"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/fb";
import { useUserStore } from "../../../store/userStore";
import useLikesStore from "../../../store/likesStore";
import Navbar from "../../../components/Navbar/Navbar";
import { useBusiness } from "../../../hooks/useBusiness";
import styles from "./page.module.css";

export default function BusinessDetail() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // Use React Query to fetch business
  const { data: business, isLoading: loadingBusiness, error } = useBusiness(params?.id);

  // Get likes from store
  const {
    getLikeStatus,
    fetchLikes,
    updateLikeStatus,
  } = useLikesStore();

  const businessId = business?._id?.toString() || business?._id || params?.id;
  const likeStatus = getLikeStatus(businessId);
  const liked = likeStatus.liked;
  const likeCount = likeStatus.count;

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
    if (user?.uid && businessId) {
      // Fetch all likes if needed (only if 1 hour has passed)
      const needsFetch = useLikesStore.getState().shouldFetch();
      if (needsFetch) {
        fetchLikes(user.uid);
      }
    }
  }, [user?.uid, businessId, fetchLikes]);

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

  const handleLike = async () => {
    if (!user?.uid || likeLoading) return;

    // Prevent liking if already liked
    if (liked) return;

    try {
      setLikeLoading(true);
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          businessId: businessId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the store with new like status
        updateLikeStatus(businessId, data.liked, data.count || 0);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
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

  if (loadingBusiness) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <p>טוען עסק...</p>
        </main>
      </div>
    );
  }

  if (error || !business) {
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
            <div className={styles.likeSection}>
              <button
                onClick={handleLike}
                disabled={liked || likeLoading || !user}
                className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
                aria-label={liked ? 'אהבתי' : 'אהב'}
              >
                <span className={styles.heartIcon}>
                  {liked ? '❤️' : '🤍'}
                </span>
              </button>
              {likeCount > 0 && (
                <span className={styles.likeCount}>{likeCount}</span>
              )}
            </div>
            <button onClick={handleShare} className={styles.shareButton}>
              {copied ? '✓ הועתק!' : 'שתף'}
            </button>
            <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
              חזור
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
