"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import { businessTypes } from "../../data/businessTypes";
import { useMyBusiness } from "../../hooks/useMyBusiness";
import { useSaveBusiness, useDeleteBusiness } from "../../hooks/useBusinessMutations";
import styles from "./page.module.css";
import { FormData } from "../../interface";

export default function MyBusiness() {
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    phone: "",
    city: "",
  });
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // Use React Query to fetch my business
  const { data: business } = useMyBusiness(user?.uid);

  // Mutations
  const saveBusinessMutation = useSaveBusiness();
  const deleteBusinessMutation = useDeleteBusiness();

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

  // Update form data when business is loaded
  useEffect(() => {
    if (business) {
      setFormData({
        title: business.title || "",
        type: business.type || "",
        phone: business.phone || "",
        city: business.city || "",
      });
    }
  }, [business]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.uid) return;

    try {
      await saveBusinessMutation.mutateAsync({
        userId: user.uid,
        businessData: formData,
      });
      alert("העסק נשמר בהצלחה!");
    } catch (error) {
      console.error("Error saving business:", error);
      alert("שגיאה בשמירת העסק");
    }
  };

  const handleDelete = async () => {
    if (!business || !user?.uid) return;

    const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק את העסק? פעולה זו לא ניתנת לביטול.");

    if (!confirmed) return;

    try {
      await deleteBusinessMutation.mutateAsync(user.uid);
      alert("העסק נמחק בהצלחה!");
      setFormData({
        title: "",
        type: "",
        phone: "",
        city: "",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting business:", error);
      alert("שגיאה במחיקת העסק");
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

  if (!user) { return null }

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
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="city">עיר:</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className={styles.input} />
          </div>

          <div className={styles.buttonsContainer}>
            <button
              type="submit"
              disabled={saveBusinessMutation.isPending}
              className={styles.submitButton}
            >
              {saveBusinessMutation.isPending ? "שומר..." : "שמור"}
            </button>
            {business && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteBusinessMutation.isPending}
                className={styles.deleteButton}
              >
                {deleteBusinessMutation.isPending ? "מוחק..." : "מחק עסק"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

