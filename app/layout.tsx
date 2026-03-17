import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OA 재고 대시보드",
  description: "오아(주) 전사 재고 현황",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
