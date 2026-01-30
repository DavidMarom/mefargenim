import { Varela_Round } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer/Footer";
import QueryProvider from "../providers/QueryProvider";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-varela-round",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mefargenim.com'),
  title: {
    default: "מפרגנים - פלטפורמה לעסקים מקומיים",
    template: "%s | מפרגנים"
  },
  description: "מפרגנים - גלו עסקים מקומיים, חפשו לפי סוג ומיקום, ותמכו בעסקים קטנים. מצאו עסקים חדשים בקלות ובמהירות.",
  keywords: ["עסקים", "עסקים מקומיים", "חיפוש עסקים", "עסקים בישראל", "תמיכה בעסקים קטנים", "מפרגנים"],
  authors: [{ name: "מפרגנים" }],
  creator: "מפרגנים",
  publisher: "מפרגנים",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: '/',
    siteName: 'מפרגנים',
    title: 'מפרגנים - פלטפורמה לעסקים מקומיים',
    description: 'גלו עסקים מקומיים, חפשו לפי סוג ומיקום, ותמכו בעסקים קטנים. מצאו עסקים חדשים בקלות ובמהירות.',
    images: [
      {
        url: '/mlogo.png',
        width: 1200,
        height: 630,
        alt: 'מפרגנים - פלטפורמה לעסקים מקומיים',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'מפרגנים - פלטפורמה לעסקים מקומיים',
    description: 'גלו עסקים מקומיים, חפשו לפי סוג ומיקום, ותמכו בעסקים קטנים.',
    images: ['/mlogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={varelaRound.variable}>
        <QueryProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ flex: '1 0 auto' }}>
              {children}
            </div>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
