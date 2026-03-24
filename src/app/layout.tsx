import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Wine Note",
  description: "나만의 와인 테이스팅 노트 & 셀러",
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <div className="max-w-2xl mx-auto px-4 pb-28">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
