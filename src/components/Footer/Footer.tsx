"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer(): React.ReactElement {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <p className={styles.phone}>
            שירות לקוחות: <a href="tel:+972545779917">054-577-9917</a>
          </p>
        </div>
        <div className={styles.footerSection}>
          <p className={styles.phone}>
            מופעל ע״י חברת{" "}
            <a
              href="https://stealthcode.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              stealthCode
            </a>
          </p>
        </div>
        <div className={styles.footerSection}>
          <Link href="/terms" className={styles.termsLink}>
            תנאי שימוש
          </Link>
        </div>
      </div>
    </footer>
  );
}

