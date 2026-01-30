import { Varela_Round } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer/Footer";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-varela-round",
});

export const metadata = {
  title: "מפרגנים",
  description: "מפרגנים לעסקים",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={varelaRound.variable}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ flex: '1 0 auto' }}>
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
