"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar/Navbar";
import { useUserStore } from "../../store/userStore";
import styles from "./page.module.css";

export default function TermsPage() {
  const user = useUserStore((state) => state.user);

  return (
    <div className={styles.page}>
      {user && <Navbar />}
      <main className={styles.main}>
        <h1>תנאי שימוש</h1>
        <div className={styles.content}>
          <section>
            <h2>1. כללי</h2>
            <p>
              תנאי שימוש אלה חלים על השימוש באתר מפרגנים. על ידי שימוש באתר זה, אתה מסכים לתנאים אלה.
            </p>
          </section>

          <section>
            <h2>2. שימוש באתר</h2>
            <p>
              אתה רשאי להשתמש באתר למטרות חוקיות בלבד. אסור להשתמש באתר בדרך שעלולה לפגוע, להשבית, להעמיס יתר על המידה או להפריע לאתר או לשירותים אחרים.
            </p>
          </section>

          <section>
            <h2>3. תוכן משתמשים</h2>
            <p>
              אתה אחראי לכל התוכן שאתה מפרסם באתר. אתה מסכים שלא לפרסם תוכן שעלול להיות פוגעני, בלתי חוקי או מפר זכויות יוצרים.
            </p>
          </section>

          <section>
            <h2>4. פרטיות</h2>
            <p>
              אנו מכבדים את פרטיותך. השימוש במידע האישי שלך מוסדר על ידי מדיניות הפרטיות שלנו.
            </p>
          </section>

          <section>
            <h2>5. שינויים בתנאים</h2>
            <p>
              אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. שינויים ייכנסו לתוקף מייד עם פרסומם באתר.
            </p>
          </section>

          <section>
            <h2>6. יצירת קשר</h2>
            <p>
              לשאלות או הערות בנוגע לתנאי שימוש אלה, אנא צור קשר באמצעות הפרטים המופיעים באתר.
            </p>
          </section>
        </div>
        <div className={styles.backLink}>
          <Link href={user ? "/dashboard" : "/"}>חזרה לדף הבית</Link>
        </div>
      </main>
    </div>
  );
}
