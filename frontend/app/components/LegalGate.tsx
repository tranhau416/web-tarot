"use client"

import { useEffect, useRef, useState } from "react"
import { STORAGE_KEYS } from "@/app/lib/constants"

// ─── Disclaimer text (unchanged) ──────────────────────────────────────────
const DISCLAIMER = `This application provides tarot readings for entertainment and introspective purposes only. All interpretations are generated using quantum random number generation and symbolic archetypal frameworks. Nothing presented here constitutes legal, medical, financial, psychological, or professional advice of any kind.

Tarot readings do not predict the future with certainty. The cards reflect symbolic possibilities and should be used as a tool for self-reflection, not as a definitive guide for life decisions. By entering this space, you acknowledge that you are 18 years of age or older and that you understand the entertainment nature of this service.`

// ─── Eye Sigil SVG ─────────────────────────────────────────────────────────
function EyeSigil({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

// ─── Checkmark SVG (inside filled circle) ──────────────────────────────────
function CheckmarkIcon() {
  return (
    <svg
      className="w-3 h-3 text-light"
      fill="none"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Ember particle config ─────────────────────────────────────────────────
const PARTICLES = [
  { left: "15%", delay: "0s",   duration: "6s"  },
  { left: "30%", delay: "1.5s", duration: "8s"  },
  { left: "55%", delay: "0.7s", duration: "5s"  },
  { left: "72%", delay: "2.2s", duration: "7s"  },
  { left: "85%", delay: "0.3s", duration: "9s"  },
]

// ─── Props ─────────────────────────────────────────────────────────────────
interface LegalGateProps {
  children: React.ReactNode
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function LegalGate({ children }: LegalGateProps) {
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
  const [check1, setCheck1]           = useState(false)
  const [check2, setCheck2]           = useState(false)
  const [confirming, setConfirming]   = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLInputElement>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hydrate from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ADULT_CONFIRMED)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional localStorage hydration
    setIsConfirmed(stored === "true")
  }, [])

  // ── Confirm handler with exit animation ──
  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEYS.ADULT_CONFIRMED, "true")
    setConfirming(true)
    confirmTimerRef.current = setTimeout(() => {
      setIsConfirmed(true)
    }, 520)
  }

  // ── Focus first element when modal opens ──
  useEffect(() => {
    if (isConfirmed === false) {
      setTimeout(() => firstFocusRef.current?.focus(), 50)
    }
  }, [isConfirmed])

  // ── Cleanup confirm timer on unmount ──
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current !== null) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  // ── Prevent body scroll while modal is shown ──
  useEffect(() => {
    if (isConfirmed === false) {
      const original = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = original }
    }
  }, [isConfirmed])

  // ── Focus trap inside modal ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !modalRef.current) return
    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last  = focusables[focusables.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  // ── Loading state (localStorage not yet read) ──
  if (isConfirmed === null) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-arcane animate-sigil-pulse">
          <EyeSigil size={40} />
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    )
  }

  // ── Already confirmed — render app ──
  if (isConfirmed) {
    return <>{children}</>
  }

  // ── Gate modal ──
  return (
    <>
      {/* Full-screen backdrop with ember particles */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void px-4 overflow-hidden">

        {/* Ambient radial glow behind modal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(124,111,205,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Ember particles (CSS-only, staggered) */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute bottom-20 w-1 h-1 rounded-full bg-flame/60 animate-ember-float pointer-events-none"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Modal card */}
        <div
          ref={modalRef}
          onKeyDown={handleKeyDown}
          className={`relative max-w-md w-full bg-abyss border border-mist rounded-2xl p-8 shadow-2xl
            transition-[opacity,transform] duration-500 ease-in
            ${confirming ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0"}`}
          style={{ animation: confirming ? undefined : "phaseFadeIn 0.8s ease-out" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-gate-title"
          aria-describedby="legal-gate-disclaimer"
          data-confirmed={confirming ? "true" : undefined}
        >

          {/* Eye sigil with sigil-pulse */}
          <div className="flex justify-center mb-6">
            <div className="text-arcane animate-sigil-pulse">
              <EyeSigil size={48} />
              <span className="sr-only">Eye Sigil</span>
            </div>
          </div>

          {/* Title — "The Threshold" */}
          <h2
            id="legal-gate-title"
            className="font-cinzel text-3xl text-light text-center mb-2 text-glow-arcane"
          >
            The Threshold
          </h2>

          {/* Subtitle — EB Garamond italic, silver */}
          <p className="font-serif italic text-silver text-base text-center mb-6">
            Confirm your intentions before entering the sanctum
          </p>

          {/* Disclaimer scroll */}
          <div
            id="legal-gate-disclaimer"
            role="region"
            aria-label="Disclaimer — scroll to read"
            tabIndex={0}
            className="border border-flame/20 bg-veil rounded-xl p-4 mb-6 max-h-40 overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
            style={{ overscrollBehavior: "contain" }}
          >
            <p className="font-serif text-sm text-pearl leading-relaxed whitespace-pre-line">
              {DISCLAIMER}
            </p>
          </div>

          {/* Checkboxes — circular ritual seals */}
          <div className="space-y-4 mb-6">

            {/* Age confirmation */}
            <label
              htmlFor="check-age"
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  id="check-age"
                  ref={firstFocusRef}
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-[background-color,border-color] duration-200 flex items-center justify-center
                    peer-focus-visible:ring-2 peer-focus-visible:ring-flame peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-abyss
                    ${check1
                      ? "bg-arcane border-arcane"
                      : "bg-transparent border-mist group-hover:border-arcane-dim"
                    }`}
                >
                  {check1 && <CheckmarkIcon />}
                </div>
              </div>
              <span className="font-sans text-sm text-pearl leading-snug">
                I confirm I am{" "}
                <strong className="text-light">18 years of age or older</strong>
              </span>
            </label>

            {/* Entertainment acknowledgement */}
            <label
              htmlFor="check-entertainment"
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  id="check-entertainment"
                  type="checkbox"
                  checked={check2}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-[background-color,border-color] duration-200 flex items-center justify-center
                    peer-focus-visible:ring-2 peer-focus-visible:ring-flame peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-abyss
                    ${check2
                      ? "bg-arcane border-arcane"
                      : "bg-transparent border-mist group-hover:border-arcane-dim"
                    }`}
                >
                  {check2 && <CheckmarkIcon />}
                </div>
              </div>
              <span className="font-sans text-sm text-pearl leading-snug">
                I understand this is for{" "}
                <strong className="text-light">entertainment purposes only</strong>
              </span>
            </label>
          </div>

          {/* CTA Button — flame gold, Cinzel */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!check1 || !check2 || confirming}
            className={`w-full py-3 px-6 rounded-xl font-cinzel font-medium text-base transition-[background-color,color,opacity] duration-200
              focus-visible:ring-2 focus-visible:ring-flame focus-visible:outline-none
              ${check1 && check2
                ? "bg-flame hover:bg-ember text-void shadow-lg cursor-pointer"
                : "bg-mist text-silver cursor-not-allowed opacity-60"
              }`}
          >
            Step Through the Threshold
          </button>

          {/* Footer note — etched style */}
          <p className="text-etched text-center mt-4">
            Your passage is remembered in this vessel
          </p>

        </div>
      </div>
    </>
  )
}
