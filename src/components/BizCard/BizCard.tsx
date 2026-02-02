"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import useLikesStore from "../../store/likesStore";
import styles from "./BizCard.module.css";
import { getDisplayLabel } from "./utils";
import {
  BizCardProps,
  BusinessDocument,
  LikeResponse,
  UserCheckResponse,
} from "./interfaces";

export default function BizCard({ document }: BizCardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  
  // Get likes from store
  const {
    getLikeStatus,
    fetchLikes,
    updateLikeStatus,
  } = useLikesStore();
  
  const businessId = document?._id?.toString() || (document?._id as string | undefined);
  const likeStatus = getLikeStatus(businessId);
  const liked = likeStatus.liked;
  const likeCount = likeStatus.count;

  useEffect(() => {
    if (user?.uid && businessId) {
      // Fetch all likes if needed (only if 1 hour has passed)
      const needsFetch = useLikesStore.getState().shouldFetch();
      if (needsFetch) {
        fetchLikes(user.uid);
      }
    }
  }, [user?.uid, businessId, fetchLikes]);

  const handleLike = async (): Promise<void> => {
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
          businessId: businessId,
        }),
      });

      const data: LikeResponse = await response.json();

      if (data.success) {
        // Update the store with new like status
        updateLikeStatus(businessId, data.liked || false, data.count || 0);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Save user information to Zustand store
      const setUser = useUserStore.getState().setUser;
      setUser(result.user);

      // Check if user exists in MongoDB, create if doesn't exist
      if (result.user?.email) {
        try {
          const userData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            emailVerified: result.user.emailVerified,
            phoneNumber: result.user.phoneNumber,
            providerData: result.user.providerData,
            metadata: {
              creationTime: result.user.metadata?.creationTime,
              lastSignInTime: result.user.metadata?.lastSignInTime,
            },
          };

          const response = await fetch('/api/users/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: result.user.email,
              userData: userData
            }),
          });

          const data: UserCheckResponse = await response.json();
          if (data.created) {
            console.log('New user created in database');
          } else if (data.exists) {
            console.log('User already exists in database');
          }
        } catch (dbError) {
          console.error('Error checking/creating user in database:', dbError);
          // Don't block login if database operation fails
        }
      }

      // After successful login, redirect to the business detail page
      router.push(`/business/${document._id?.toString() || document._id}`);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleOpen = (): void => {
    if (!user) { 
      handleGoogleLogin();
    } else { 
      router.push(`/business/${document._id?.toString() || document._id}`);
    }
  };

  // Function to format phone number for tel: link (remove spaces, dashes, etc.)
  const formatPhoneForTel = (phone: unknown): string => {
    if (!phone) return '';
    // Remove all non-digit characters except + for international numbers
    return phone.toString().replace(/[^\d+]/g, '');
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
          let displayValue: string;
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
          // Special handling for phone numbers - make them clickable
          const isPhone = key === 'phone' && value && value !== 'לא זמין';
          
          return (
            <div key={key} className={styles.field}>
              <span className={styles.label}>{getDisplayLabel(key)}:</span>
              {isPhone ? (
                <a 
                  href={`tel:${formatPhoneForTel(value)}`}
                  className={styles.phoneLink}
                >
                  {displayValue}
                </a>
              ) : (
                <span className={styles.value}>{displayValue}</span>
              )}
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
            aria-label={liked ? 'אהבתי' : 'אהב'}
          >
            <span className={styles.heartIcon}>
              {liked ? '❤️' : '🤍'}
            </span>
          </button>
          {likeCount > 0 && (<span className={styles.likeCount}>{likeCount}</span>)}
        </div>
        <button onClick={handleOpen} className={styles.openButton}>
          פתח
        </button>
      </div>
    </div>
  );
}
