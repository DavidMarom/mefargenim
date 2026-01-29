"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar";
import styles from "./page.module.css";

export default function MyBusiness() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    zip: '',
    country: '',
  });
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
    if (user?.uid) {
      fetchBusiness();
    }
  }, [user]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/biz/my-business?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBusiness(data.data);
        setFormData({
          title: data.data.title || '',
          type: data.data.type || '',
          address: data.data.address || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          city: data.data.city || '',
          zip: data.data.zip || '',
          country: data.data.country || '',
        });
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/biz/my-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          businessData: formData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBusiness(data.data);
        alert('העסק נשמר בהצלחה!');
      } else {
        alert('שגיאה בשמירת העסק');
      }
    } catch (error) {
      console.error('Error saving business:', error);
      alert('שגיאה בשמירת העסק');
    } finally {
      setSaving(false);
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

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h1>ערוך את העסק שלך</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">שם העסק:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">סוג העסק:</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">כתובת העסק:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">טלפון:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">אימייל העסק:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="city">עיר:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="zip">מיקוד:</label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country">מדינה:</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <button type="submit" disabled={saving} className={styles.submitButton}>
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </form>
      </main>
    </div>
  );
}
