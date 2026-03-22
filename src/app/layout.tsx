import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wine Note",
  description: "나만의 와인 테이스팅 노트 & 셀러",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-geist-sans)]" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Background decoration blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="bg-blob" style={{ top: '-10%', left: '10%', width: '500px', height: '500px', background: 'rgba(139, 34, 82, 0.08)' }} />
          <div className="bg-blob" style={{ bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'rgba(160, 68, 110, 0.06)', animationDelay: '4s' }} />
          <div className="bg-blob" style={{ top: '40%', left: '60%', width: '300px', height: '300px', background: 'rgba(180, 130, 70, 0.05)', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
