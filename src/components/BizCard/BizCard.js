"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import styles from "./BizCard.module.css";

export default function BizCard({ document }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user?.uid && document?._id) {
      fetchLikeStatus();
    }
  }, [user, document]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(
        `/api/likes?userId=${user.uid}&businessId=${document._id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user?.uid || loading) return;

    // Prevent liking if already liked
    if (liked) return;

    try {
      setLoading(true);
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          businessId: document._id.toString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
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

  // Only show title, type, phone, and city
  const allowedFields = ['title', 'type', 'phone', 'city'];
  const entries = Object.entries(document).filter(([key]) => 
    allowedFields.includes(key)
  );
  
  // Sort entries to ensure title is first, then type, phone, city
  entries.sort(([keyA], [keyB]) => {
    const order = ['title', 'type', 'phone', 'city'];
    return order.indexOf(keyA) - order.indexOf(keyB);
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {entries.map(([key, value], index) => {
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

          // First field: show only value as H2, no label
          if (index === 0) {
            return (
              <div key={key} className={styles.field}>
                <h2 className={styles.title}>{displayValue}</h2>
              </div>
            );
          }

          // Other fields: show label and value
          return (
            <div key={key} className={styles.field}>
              <span className={styles.label}>{getDisplayLabel(key)}:</span>
              <span className={styles.value}>{displayValue}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.actionsSection}>
        <div className={styles.likeSection}>
          <button
            onClick={handleLike}
            disabled={liked || loading || !user}
            className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
          >
            {liked ? '✓ אהבתי' : 'אהבתי'}
          </button>
          {likeCount > 0 && (
            <span className={styles.likeCount}>{likeCount}</span>
          )}
        </div>
        <button
          onClick={() => router.push(`/business/${document._id?.toString() || document._id}`)}
          className={styles.openButton}
        >
          פתח
        </button>
      </div>
    </div>
  );
}
