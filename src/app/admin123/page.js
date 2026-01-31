"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/fb";
import { useUserStore } from "../../store/userStore";
import Navbar from "../../components/Navbar/Navbar";
import { businessTypes } from "../../data/businessTypes";
import styles from "./page.module.css";

const ADMIN_PASSWORD = 'azsx';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [bizDocuments, setBizDocuments] = useState([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingBusinesses, setExportingBusinesses] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsPasswordAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('סיסמה שגויה. נסה שוב.');
      setPasswordInput('');
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
      const response = await fetch('/api/biz/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData: {
            title: formData.title,
            type: formData.type,
            phone: formData.phone,
            city: formData.city,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('העסק נוסף בהצלחה!');
        setFormData({
          title: '',
          type: '',
          phone: '',
          city: '',
        });
        // Refresh the businesses list
        fetchBizDocuments();
      } else {
        alert(`שגיאה בהוספת העסק: ${data.error || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error('Error creating business:', error);
      alert('שגיאה בהוספת העסק');
    } finally {
      setSaving(false);
    }
  };

  const handleExportUsers = async () => {
    setExportingUsers(true);
    try {
      const response = await fetch('/api/users/export');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export users');
      }

      // Get the CSV content
      const csv = await response.text();
      
      // Create a blob and download it
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert(`שגיאה בייצוא המשתמשים: ${error.message}`);
    } finally {
      setExportingUsers(false);
    }
  };

  const handleExportBusinesses = async () => {
    setExportingBusinesses(true);
    try {
      const response = await fetch('/api/biz/export');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export businesses');
      }

      // Get the CSV content
      const csv = await response.text();
      
      // Create a blob and download it
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `businesses-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting businesses:', error);
      alert(`שגיאה בייצוא העסקים: ${error.message}`);
    } finally {
      setExportingBusinesses(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('אנא בחר קובץ CSV בלבד');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      alert('אנא בחר קובץ CSV להעלאה');
      return;
    }

    setUploadingCSV(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/biz/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      // Success message
      setUploadMessage(`✅ הועלו בהצלחה ${data.imported} עסקים${data.failed > 0 ? ` (${data.failed} נכשלו)` : ''}`);
      
      // Clear file input
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // Refresh business list
      fetchBizDocuments();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadMessage(`❌ שגיאה: ${error.message}`);
    } finally {
      setUploadingCSV(false);
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

  // Password protection - show password form if not authenticated
  if (!isPasswordAuthenticated) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.passwordContainer}>
            <h2>פאנל ניהול - נדרשת סיסמה</h2>
            <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label htmlFor="password">הכנס סיסמה:</label>
                <input
                  type="password"
                  id="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  className={styles.input}
                  placeholder="הכנס סיסמה"
                  required
                  autoFocus
                />
                {passwordError && (
                  <p className={styles.errorMessage}>{passwordError}</p>
                )}
              </div>
              <button type="submit" className={styles.submitButton}>
                התחבר
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate statistics
  const totalBusinesses = bizDocuments.length;
  const businessesByType = bizDocuments.reduce((acc, biz) => {
    const type = biz.type || 'ללא סוג';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const businessesByCity = bizDocuments.reduce((acc, biz) => {
    const city = biz.city || 'ללא עיר';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>פאנל ניהול</h1>
          <p className={styles.subtitle}>ניהול וסטטיסטיקות של המערכת</p>
        </div>

        <div className={styles.exportSection}>
          <button
            onClick={handleExportUsers}
            disabled={exportingUsers}
            className={styles.exportButton}
          >
            {exportingUsers ? 'מייצא...' : '📥 ייצא משתמשים ל-CSV'}
          </button>
          <button
            onClick={handleExportBusinesses}
            disabled={exportingBusinesses}
            className={styles.exportButton}
          >
            {exportingBusinesses ? 'מייצא...' : '📥 ייצא עסקים ל-CSV'}
          </button>
        </div>

        <div className={styles.importSection}>
          <h3>ייבא עסקים מקובץ CSV</h3>
          <p className={styles.importHint}>הקובץ צריך להכיל את העמודות: title, phone, city, type</p>
          <div className={styles.importControls}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className={styles.fileInput}
              id="csvFileInput"
            />
            <label htmlFor="csvFileInput" className={styles.fileInputLabel}>
              {selectedFile ? selectedFile.name : 'בחר קובץ CSV'}
            </label>
            <button
              onClick={handleCSVUpload}
              disabled={!selectedFile || uploadingCSV}
              className={styles.importButton}
            >
              {uploadingCSV ? 'מייבא...' : '📤 ייבא עסקים'}
            </button>
          </div>
          {uploadMessage && (
            <p className={styles.uploadMessage}>{uploadMessage}</p>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>סה"כ עסקים</h3>
              <p className={styles.statNumber}>{totalBusinesses}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏢</div>
            <div className={styles.statContent}>
              <h3>סוגי עסקים</h3>
              <p className={styles.statNumber}>{Object.keys(businessesByType).length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📍</div>
            <div className={styles.statContent}>
              <h3>ערים</h3>
              <p className={styles.statNumber}>{Object.keys(businessesByCity).length}</p>
            </div>
          </div>
        </div>

        <div className={styles.addBusinessSection}>
          <h2>הוסף עסק חדש</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
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
                  placeholder="הכנס שם העסק"
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
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city">עיר:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="הכנס עיר"
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
                  placeholder="הכנס מספר טלפון"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.submitButton}>
                {saving ? 'מוסיף...' : 'הוסף עסק'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.sectionsGrid}>
          <div className={styles.sectionCard}>
            <h2>פילוח לפי סוג עסק</h2>
            <div className={styles.listContainer}>
              {Object.entries(businessesByType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className={styles.listItem}>
                    <span className={styles.listLabel}>{type}</span>
                    <span className={styles.listValue}>{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2>פילוח לפי עיר</h2>
            <div className={styles.listContainer}>
              {Object.entries(businessesByCity)
                .sort((a, b) => b[1] - a[1])
                .map(([city, count]) => (
                  <div key={city} className={styles.listItem}>
                    <span className={styles.listLabel}>{city}</span>
                    <span className={styles.listValue}>{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.businessesSection}>
          <h2>כל העסקים ({totalBusinesses})</h2>
          {loadingBiz ? (
            <p>טוען עסקים...</p>
          ) : bizDocuments.length === 0 ? (
            <p className={styles.noData}>אין עסקים במערכת</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>שם העסק</th>
                    <th>סוג</th>
                    <th>עיר</th>
                    <th>טלפון</th>
                    <th>כתובת</th>
                  </tr>
                </thead>
                <tbody>
                  {bizDocuments.map((biz, index) => (
                    <tr key={biz._id?.toString() || index}>
                      <td>{biz.title || biz.name || '-'}</td>
                      <td>{biz.type || '-'}</td>
                      <td>{biz.city || '-'}</td>
                      <td>{biz.phone || '-'}</td>
                      <td>{biz.address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
