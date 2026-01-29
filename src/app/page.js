"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/fb";
import { useUserStore } from "../store/userStore";
import styles from "./page.module.css";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Home() {
  const [loading, setLoading] = useState(true);
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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>ברוך הבא</h1>
        <GoogleLoginButton />
      </main>
    </div>
  );
}
