import React from "react";
import type { ReactNode } from "react";

export const metadata = {
  title: "לוח בקרה - עסקים",
  description:
    "גלו עסקים מקומיים, חפשו לפי סוג עסק ועיר, ותמכו בעסקים קטנים. מצאו את העסקים הטובים ביותר באזור שלכם.",
  openGraph: {
    title: "לוח בקרה - עסקים | מפרגנים",
    description:
      "גלו עסקים מקומיים, חפשו לפי סוג עסק ועיר, ותמכו בעסקים קטנים.",
    url: "/dashboard",
  },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactElement {
  return <>{children}</>;
}

