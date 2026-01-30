"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "@/store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import BizCard from "../../components/BizCard/BizCard";
import { businessTypes } from "../../data/businessTypes";
import styles from "./page.module.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [bizDocuments, setBizDocuments] = useState([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

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

  useEffect(() => {
    // Fetch Biz documents when user is authenticated
    if (user) {
      fetchBizDocuments();
    }
  }, [user]);

  const fetchBizDocuments = async () => {
    try {
      setLoadingBiz(true);
      const response = await fetch('/api/biz');
      const data = await response.json();
      
      if (data.success) {
        setBizDocuments(data.data || []);
      } else {
        console.error('Failed to fetch Biz documents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Biz documents:', error);
    } finally {
      setLoadingBiz(false);
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

  // Filter businesses by type
  const filteredDocuments = selectedType === "all" 
    ? bizDocuments 
    : bizDocuments.filter(doc => doc.type === selectedType);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.headerSection}>
          <h1>עסקים:</h1>
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
        </div>
        {loadingBiz ? (
          <p>טוען מסמכים...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className={styles.noDocuments}>אין מסמכים להצגה</p>
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
