"use client";

import styles from "./BizCard.module.css";

export default function BizCard({ document }) {
  // Function to get display label for field names
  const getDisplayLabel = (key) => {
    if (key === 'title') {
      return 'שם העסק';
    }
    if (key === 'type') {
      return 'סוג העסק';
    }
    if (key === 'address') {
      return 'כתובת העסק';
    }
    if (key === 'phone') {
      return 'טלפון';
    }
    if (key === 'email') {
      return 'אימייל העסק';
    }
    if (key === 'city') {
      return 'עיר';
    }
    if (key === 'zip') {
      return 'מיקוד';
    }
    if (key === 'country') {
      return 'מדינה';
    }
    return key;
  };

  // Filter out _id and get entries
  const entries = Object.entries(document).filter(([key]) => key !== '_id');

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {entries.map(([key, value], index) => {
          // Format the value for display
          let displayValue = value;
          if (value === null || value === undefined) {
            displayValue = 'לא זמין';
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
          } else if (value instanceof Date) {
            displayValue = value.toLocaleDateString('he-IL');
          } else {
            displayValue = String(value);
          }

          // First field: show only value as H2, no label
          if (index === 0) {
            return (
              <div key={key} className={styles.field}>
                <h2 className={styles.title}>{displayValue}</h2>
              </div>
            );
          }

          // Other fields: show label and value
          return (
            <div key={key} className={styles.field}>
              <span className={styles.label}>{getDisplayLabel(key)}:</span>
              <span className={styles.value}>{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
