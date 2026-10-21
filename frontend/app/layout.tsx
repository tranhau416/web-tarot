import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "./components/BrandMark";
import LegalGate from "./components/LegalGate";
import NavLink from "./components/NavLink";
import { STRINGS } from "./lib/strings";
import "./globals.css";

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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-light antialiased min-h-screen">
        <LegalGate>
          <header className="fixed top-0 left-0 right-0 z-40 border-b border-mist bg-void/85 backdrop-blur-sm">
            <nav
              aria-label="Chính"
              className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between"
            >
              <Link
                href="/"
                className="flex items-center gap-2.5 text-pearl hover:text-light transition-colors font-serif text-xl tracking-wide"
              >
                <BrandMark className="w-7 h-7" />
                {STRINGS.BRAND}
              </Link>
              <NavLink href="/history">{STRINGS.HISTORY}</NavLink>
            </nav>
          </header>

          <main className="pt-14">{children}</main>
        </LegalGate>
      </body>
    </html>
  );
}
