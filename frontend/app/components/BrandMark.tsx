/** Logo: trăng lưỡi liềm vàng và một ngôi sao trong vòng tròn. */
export default function BrandMark({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" stroke="#F2C14E" strokeOpacity="0.35" />
      <path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" fill="#F2C14E" />
      <path
        d="M23.5 8.5 L24.35 11.15 L27 12 L24.35 12.85 L23.5 15.5 L22.65 12.85 L20 12 L22.65 11.15 Z"
        fill="#F3F1EC"
      />
    </svg>
  )
}
