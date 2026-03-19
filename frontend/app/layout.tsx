import type { Metadata } from "next";
import LegalGate from "./components/LegalGate";
import NavBar from "./components/NavBar";
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
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#02020A" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Cinzel added for ritual headers per spec §3 */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-light antialiased min-h-screen">
        <LegalGate>
          {/* NavBar is a Client Component — handles scroll detection internally */}
          <NavBar />

          {/* pt-12 = 48px — matches fixed nav height */}
          <div className="pt-12">{children}</div>
        </LegalGate>
      </body>
    </html>
  );
}
