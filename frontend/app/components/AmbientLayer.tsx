import type { CSSProperties } from "react"

/**
 * Lớp nền chuyển động phía sau nội dung, mỗi giao diện một kiểu:
 * Đêm trong — sao nhấp nháy và một vệt sao băng; Pixel hồng — tim và lấp lánh pixel bay lên;
 * Cúc hoạ mi — cánh hoa cúc rơi. Chỉ dùng transform/opacity; ẩn hẳn khi bật giảm chuyển động.
 */

// Vị trí cố định (không ngẫu nhiên) để server và client render giống nhau.
const STARS: [left: number, top: number, size: number, delay: number, duration: number][] = [
  [6, 12, 2, 0, 3.4], [14, 38, 3, 1.2, 4.1], [22, 8, 2, 2.1, 3.0], [31, 26, 2, 0.6, 3.8],
  [39, 62, 3, 1.8, 4.4], [47, 16, 2, 2.6, 3.2], [55, 44, 2, 0.3, 3.6], [63, 9, 3, 1.5, 4.0],
  [71, 33, 2, 2.9, 3.3], [79, 58, 2, 0.9, 4.2], [87, 20, 3, 2.3, 3.5], [94, 46, 2, 1.1, 3.9],
  [10, 74, 2, 2.7, 4.3], [27, 86, 3, 0.4, 3.7], [52, 80, 2, 1.6, 3.1], [74, 90, 2, 2.0, 4.5],
  [90, 76, 3, 0.8, 3.4], [35, 50, 2, 3.0, 4.0],
]

const RISERS: [left: number, size: number, delay: number, duration: number, heart: boolean][] = [
  [5, 14, 0, 17, true], [16, 10, 6, 21, false], [27, 12, 11, 18, true], [41, 9, 3, 23, false],
  [56, 13, 8, 19, true], [68, 10, 14, 22, false], [79, 15, 2, 20, true], [91, 9, 9, 24, false],
]

const PETALS: [left: number, size: number, delay: number, duration: number, flower: boolean][] = [
  [2, 12, 0, 19, false], [12, 18, 7, 23, true], [24, 10, 3, 17, false], [36, 13, 12, 21, false],
  [48, 16, 5, 25, true], [60, 11, 9, 18, false], [71, 14, 1, 22, false], [83, 20, 13, 26, true],
  [93, 10, 6, 20, false],
]

const timing = (delay: number, duration: number): CSSProperties => ({
  animationDelay: `${-delay}s`,
  animationDuration: `${duration}s`,
})

function PixelSpark({ heart }: { heart: boolean }) {
  return heart ? (
    <svg viewBox="0 0 7 6" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <path className="fill-gold" d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z" />
      <path fill="#FFFFFF" d="M1 1h1v1H1z" />
    </svg>
  ) : (
    <svg viewBox="0 0 5 5" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <path className="fill-gold" d="M2 0h1v5H2zM0 2h5v1H0z" />
    </svg>
  )
}

function Petal({ flower }: { flower: boolean }) {
  return flower ? (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <g fill="#FFFFFF" stroke="#C9D9B0" strokeWidth="1">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="16" cy="8" rx="3.2" ry="7" transform={`rotate(${deg} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="4.4" fill="#FFC72C" />
    </svg>
  ) : (
    <svg viewBox="0 0 10 22" className="h-full w-full" aria-hidden="true">
      <ellipse cx="5" cy="11" rx="4" ry="10" fill="#FFFFFF" stroke="#C9D9B0" strokeWidth="1" />
    </svg>
  )
}

export default function AmbientLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
      {/* Đêm trong */}
      <div className="absolute inset-0 pixel:hidden daisy:hidden">
        {STARS.map(([left, top, size, delay, duration], i) => (
          <span
            key={i}
            className={`absolute block rounded-full animate-twinkle ${i % 4 === 0 ? "bg-gold" : "bg-light"}`}
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, ...timing(delay, duration) }}
          />
        ))}
        <span
          className="absolute right-[-10vw] top-[12vh] block h-px w-40 rotate-[-25deg] animate-shoot
            bg-[linear-gradient(90deg,var(--color-light),transparent)]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Pixel hồng */}
      <div className="absolute inset-0 hidden pixel:block">
        {RISERS.map(([left, size, delay, duration, heart], i) => (
          <span
            key={i}
            className="absolute top-full block animate-rise"
            style={{ left: `${left}%`, width: size, height: size, ...timing(delay, duration) }}
          >
            <span className="block h-full w-full animate-blink" style={{ animationDelay: `${i * 0.35}s` }}>
              <PixelSpark heart={heart} />
            </span>
          </span>
        ))}
      </div>

      {/* Cúc hoạ mi */}
      <div className="absolute inset-0 hidden daisy:block">
        {PETALS.map(([left, size, delay, duration, flower], i) => (
          <span
            key={i}
            className="absolute -top-8 block animate-fall"
            style={{ left: `${left}%`, width: size, height: flower ? size : size * 2.2, ...timing(delay, duration) }}
          >
            <Petal flower={flower} />
          </span>
        ))}
      </div>
    </div>
  )
}
