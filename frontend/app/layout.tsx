import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import Link from "next/link";
import BrandMark from "./components/BrandMark";
import LegalGate from "./components/LegalGate";
import NavLink from "./components/NavLink";
import { STRINGS } from "./lib/strings";
import "./globals.css";

// Be Vietnam Pro được vẽ riêng cho tiếng Việt: chữ thường cao, dấu chồng tách bạch.
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-be-vietnam",
  display: "swap",
});

// Fraunces chỉ dùng cho tiêu đề lớn (từ 28px), nơi chữ có chân vẫn rõ ràng.
const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sacred Tarot — Trải bài Tarot bằng ngẫu nhiên lượng tử",
  description:
    "Đặt câu hỏi, chọn kiểu trải bài và nhận lời đọc từ bộ Rider-Waite-Smith 1909. Mỗi lá được chọn bằng nguồn ngẫu nhiên lượng tử.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="bg-void text-light antialiased min-h-screen">
        <LegalGate>
          <header className="fixed top-0 left-0 right-0 z-40 border-b border-veil bg-void/90 backdrop-blur-sm">
            <nav
              aria-label="Chính"
              className="max-w-6xl mx-auto px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4"
            >
              <Link
                href="/"
                className="flex items-center gap-3 text-light hover:text-gold-soft transition-colors"
              >
                <BrandMark className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="font-display text-xl sm:text-[22px] font-medium whitespace-nowrap">{STRINGS.BRAND}</span>
              </Link>
              <div className="flex items-center gap-1">
                <div className="hidden sm:block">
                  <NavLink href="/">{STRINGS.NAV_READ}</NavLink>
                </div>
                <NavLink href="/history">{STRINGS.HISTORY}</NavLink>
              </div>
            </nav>
          </header>

          <main className="pt-16 sm:pt-[72px]">{children}</main>
        </LegalGate>
      </body>
    </html>
  );
}
