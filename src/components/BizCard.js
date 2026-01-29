"use client";

import styles from "./BizCard.module.css";

export default function BizCard({ document }) {
  // Convert MongoDB _id to string for display
  const documentId = document._id?.toString() || '';

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {Object.entries(document).map(([key, value]) => {
          // Skip _id field or handle it specially
          if (key === '_id') {
            return (
              <div key={key} className={styles.field}>
                <span className={styles.label}>ID:</span>
                <span className={styles.value}>{documentId}</span>
              </div>
            );
          }
          
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

          return (
            <div key={key} className={styles.field}>
              <span className={styles.label}>{key}:</span>
              <span className={styles.value}>{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
