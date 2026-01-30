"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <div className={styles.userSection}>
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="פרופיל"
              width={40}
              height={40}
              className={styles.profileImage}
            />
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            התנתק
          </button>
        </div>
        <div className={styles.centerLinks}>
          <Link href="/dashboard" className={styles.navLink}>
            ראשי
          </Link>
          <Link href="/my-business" className={styles.navLink}>
            העסק שלי
          </Link>
        </div>
        <div className={styles.logo}>
          <Link href="/dashboard">
            <Image
              src="/mlogo.png"
              alt="מפרגנים"
              width={100}
              height={70}
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
