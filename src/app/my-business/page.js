"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import { businessTypes } from "../../data/businessTypes";
import styles from "./page.module.css";

export default function MyBusiness() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    phone: '',
    city: '',
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
          phone: data.data.phone || '',
          city: data.data.city || '',
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

  const handleDelete = async () => {
    if (!business) return;

    const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק את העסק? פעולה זו לא ניתנת לביטול.');
    
    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/biz/my-business?userId=${user.uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('העסק נמחק בהצלחה!');
        setBusiness(null);
        setFormData({
          title: '',
          type: '',
          phone: '',
          city: '',
        });
        router.push('/dashboard');
      } else {
        alert('שגיאה במחיקת העסק');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('שגיאה במחיקת העסק');
    } finally {
      setDeleting(false);
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
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={styles.input}
            >
              <option value="">בחר סוג עסק</option>
              {businessTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
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

          <div className={styles.buttonsContainer}>
            <button type="submit" disabled={saving} className={styles.submitButton}>
              {saving ? 'שומר...' : 'שמור'}
            </button>
            {business && (
              <button 
                type="button" 
                onClick={handleDelete} 
                disabled={deleting} 
                className={styles.deleteButton}
              >
                {deleting ? 'מוחק...' : 'מחק עסק'}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
