"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import styles from "./page.module.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Welcome, {user.displayName || user.email}!</h1>
        <div className={styles.userInfo}>
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="Profile"
              width={100}
              height={100}
              className={styles.avatar}
            />
          )}
          <div className={styles.details}>
            <p><strong>Email:</strong> {user.email}</p>
            {user.displayName && (
              <p><strong>Name:</strong> {user.displayName}</p>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </main>
    </div>
  );
}
