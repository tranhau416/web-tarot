import type { Metadata } from "next";
import Link from "next/link";
import LegalGate from "./components/LegalGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sacred Tarot — Quantum-Powered Readings",
  description:
    "Experience quantum-powered tarot readings in a sacred digital space. Connect with ancient wisdom through modern technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-40 border-b border-mist bg-void/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
              <Link
                href="/"
                className="text-pearl hover:text-glow transition-colors duration-200 font-serif text-xl tracking-wide"
              >
                🔮 Tarot
              </Link>
            </div>
          </nav>

          {/* Main content with top padding for fixed nav */}
          <main className="pt-14">{children}</main>
        </LegalGate>
      </body>
    </html>
  );
}
