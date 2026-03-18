"use client"

import { useEffect, useState } from "react"
import { STORAGE_KEYS } from "@/app/lib/constants"

const DISCLAIMER = `This application provides tarot readings for entertainment and introspective purposes only. All interpretations are generated using quantum random number generation and symbolic archetypal frameworks. Nothing presented here constitutes legal, medical, financial, psychological, or professional advice of any kind.

Tarot readings do not predict the future with certainty. The cards reflect symbolic possibilities and should be used as a tool for self-reflection, not as a definitive guide for life decisions. By entering this space, you acknowledge that you are 18 years of age or older and that you understand the entertainment nature of this service.`

interface LegalGateProps {
  children: React.ReactNode
}

export default function LegalGate({ children }: LegalGateProps) {
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ADULT_CONFIRMED)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional localStorage hydration pattern
    setIsConfirmed(stored === "true")
  }, [])

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEYS.ADULT_CONFIRMED, "true")
    setIsConfirmed(true)
  }

  // Still loading from localStorage
  if (isConfirmed === null) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-arcane border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Already confirmed — render app
  if (isConfirmed) {
    return <>{children}</>
  }

  // Show modal gate
  return (
    <>
      {/* Blurred background content hint */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/95 backdrop-blur-sm px-4">
        <div
          className="bg-ink border border-mist rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-gate-title"
          aria-describedby="legal-gate-disclaimer"
        >
          {/* Sacred Symbol */}
          <div className="flex justify-center mb-6">
            <div className="text-5xl animate-float select-none">🔮</div>
          </div>

          {/* Title */}
          <h1
            id="legal-gate-title"
            className="font-serif text-3xl text-light text-center mb-2"
          >
            Sacred Space
          </h1>
          <p className="text-silver text-sm text-center mb-6 font-sans">
            An archetypal space for reflection & self-discovery
          </p>

          {/* Disclaimer Scroll */}
          <div
            id="legal-gate-disclaimer"
            className="bg-veil border border-mist rounded-xl p-4 mb-6 max-h-40 overflow-y-auto"
          >
            <p className="text-silver text-xs leading-relaxed font-sans whitespace-pre-line">
              {DISCLAIMER}
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 mb-6">
            <label
              htmlFor="check-age"
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  id="check-age"
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                    ${check1
                      ? "bg-arcane border-arcane"
                      : "bg-transparent border-mist group-hover:border-arcane-dim"
                    }`}
                >
                  {check1 && (
                    <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-pearl text-sm font-sans leading-snug">
                I confirm I am <strong className="text-light">18 years of age or older</strong>
              </span>
            </label>

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
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                    ${check2
                      ? "bg-arcane border-arcane"
                      : "bg-transparent border-mist group-hover:border-arcane-dim"
                    }`}
                >
                  {check2 && (
                    <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-pearl text-sm font-sans leading-snug">
                I understand this is for{" "}
                <strong className="text-light">entertainment purposes only</strong>
              </span>
            </label>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleConfirm}
            disabled={!check1 || !check2}
            className={`w-full py-3 px-6 rounded-xl font-sans font-medium text-base transition-all duration-200
              ${check1 && check2
                ? "bg-arcane hover:bg-glow text-light shadow-lg shadow-arcane/25 cursor-pointer"
                : "bg-mist text-silver cursor-not-allowed opacity-60"
              }`}
          >
            Enter the Sacred Space
          </button>

          <p className="text-silver/70 text-xs text-center mt-4 font-sans">
            Your consent is remembered in this browser.
          </p>
        </div>
      </div>
    </>
  )
}
