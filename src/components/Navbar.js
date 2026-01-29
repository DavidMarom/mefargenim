"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "../services/fb";
import { useUserStore } from "../store/userStore";
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
        <div className={styles.logo}>
          <h2>מפרגנים</h2>
        </div>
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
      </div>
    </nav>
  );
}
