"use client"

import { useState, useSyncExternalStore } from "react"
import BrandMark from "@/app/components/BrandMark"
import { STORAGE_KEYS } from "@/app/lib/constants"
import { STRINGS } from "@/app/lib/strings"

const CONSENT_EVENT = "tarot-consent-change"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CONSENT_EVENT, onChange)
  }
}

function readConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADULT_CONFIRMED) === "true"
  } catch {
    return false
  }
}

function Checkbox({ id, checked, onChange, children }: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors
          peer-focus-visible:ring-2 peer-focus-visible:ring-glow peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink
          ${checked ? "bg-arcane border-arcane" : "border-silver group-hover:border-glow"}`}
      >
        {checked && (
          <svg className="w-3 h-3 text-light" viewBox="0 0 12 12">
            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-pearl text-sm leading-snug">{children}</span>
    </label>
  )
}

/**
 * Cổng 18+: app vẫn hiển thị (mờ, không tương tác được) phía sau hộp xác nhận.
 * Nếu trình duyệt chặn localStorage, xác nhận vẫn có hiệu lực trong phiên hiện tại.
 */
export default function LegalGate({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, readConsent, () => true)
  const [confirmedNow, setConfirmedNow] = useState(false)
  const [age, setAge] = useState(false)
  const [fun, setFun] = useState(false)
  const confirmed = stored || confirmedNow

  const handleConfirm = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADULT_CONFIRMED, "true")
      window.dispatchEvent(new Event(CONSENT_EVENT))
    } catch {
      // bộ nhớ bị chặn — chỉ ghi nhớ trong phiên này
    }
    setConfirmedNow(true)
  }

  return (
    <>
      <div inert={!confirmed} className={confirmed ? undefined : "blur-sm select-none"}>
        {children}
      </div>

      {!confirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm px-4">
          <div
            className="bg-ink border border-mist rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-gate-title"
            aria-describedby="legal-gate-body"
          >
            <div className="flex justify-center mb-5">
              <BrandMark className="w-14 h-14" />
            </div>
            <h1 id="legal-gate-title" className="font-serif text-3xl text-light text-center mb-1">
              {STRINGS.GATE_TITLE}
            </h1>
            <p className="text-silver text-sm text-center mb-5">{STRINGS.GATE_SUBTITLE}</p>

            <p id="legal-gate-body" className="text-pearl/90 text-sm leading-relaxed bg-veil border border-mist rounded-xl p-4 mb-5">
              {STRINGS.GATE_BODY}
            </p>

            <div className="space-y-2 mb-6">
              <Checkbox id="check-age" checked={age} onChange={setAge}>
                {STRINGS.GATE_CHECK_AGE}
              </Checkbox>
              <Checkbox id="check-entertainment" checked={fun} onChange={setFun}>
                {STRINGS.GATE_CHECK_FUN}
              </Checkbox>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!age || !fun}
              className="w-full py-3 px-6 rounded-xl font-medium transition-colors
                bg-cta hover:bg-cta-hover text-light shadow-lg shadow-arcane/25
                disabled:bg-mist disabled:text-silver disabled:shadow-none disabled:cursor-not-allowed"
            >
              {STRINGS.GATE_ENTER}
            </button>
            <p className="text-silver text-xs text-center mt-4">{STRINGS.GATE_REMEMBERED}</p>
          </div>
        </div>
      )}
    </>
  )
}
