// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata = {
  title: "מפרגנים",
  description: "מפרגנים לעסקים",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
