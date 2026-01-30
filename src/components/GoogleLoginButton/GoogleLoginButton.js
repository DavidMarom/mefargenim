"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import styles from "./GoogleLoginButton.module.css";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Save user information to Zustand store
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
          
          const data = await response.json();
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
      
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "מתחבר..." : "התחבר עם Google"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
