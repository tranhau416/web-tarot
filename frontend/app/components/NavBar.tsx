"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// Eye Sigil SVG — inline, 20×20 viewport
function EyeSigil() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    // Check immediately in case the page is already scrolled on mount
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Skip-to-content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-flame focus:text-void focus:px-4 focus:py-2 focus:rounded-lg focus:font-cinzel focus:text-sm focus:tracking-wider"
      >
        Skip to main content
      </a>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-12 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-void/80 backdrop-blur-md border-b border-mist/40"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="Site navigation"
      >
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-silver hover:text-pearl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm"
            aria-label="ARCANA — home"
          >
            <EyeSigil />
            <span className="font-cinzel text-[13px] tracking-[0.25em] uppercase">
              ARCANA
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}
