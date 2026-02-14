import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "בלוג",
  description: "מאמרים וטיפים לקידום העסק שלכם – דפי נחיתה, שיווק דיגיטלי וקידום עסקים מקומיים.",
  openGraph: {
    title: "בלוג | מפרגנים",
    description: "מאמרים וטיפים לקידום העסק שלכם.",
    url: "/blog",
  },
};

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>בלוג</h1>
        <p className={styles.subtitle}>מאמרים וטיפים לקידום העסק שלכם.</p>
        <nav className={styles.postList} aria-label="רשימת מאמרים">
          <Link href="/blog/landing-page" className={styles.postLink}>
            קידום עסק עם דף נחיתה
          </Link>
          <Link href="/blog/website-presence" className={styles.postLink}>
            למה חשוב שיהיה לעסק אתר תדמית
          </Link>
        </nav>
        <Link href="/" className={styles.backLink}>
          ← חזרה לדף הבית
        </Link>
      </main>
    </div>
  );
}
