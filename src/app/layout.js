import { Varela_Round } from "next/font/google";
import "./globals.css";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-varela-round",
});

export const metadata = {
  title: "מפרגנים",
  description: "מפרגנים לעסקים",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={varelaRound.variable}>
        {children}
      </body>
    </html>
  );
}
