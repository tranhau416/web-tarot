import Image from "next/image"
import { STRINGS } from "@/app/lib/strings"

const SIDE = "w-[92px] sm:w-32 lg:w-[172px] top-[22px] sm:top-5 lg:top-[150px]"
const FAN = [
  { src: "/cards/00-the-fool.webp", className: `${SIDE} -translate-x-[116%] -rotate-[10deg]` },
  { src: "/cards/21-the-world.webp", className: `${SIDE} translate-x-[16%] rotate-[10deg]` },
  { src: "/cards/17-the-star.webp", className: "w-[100px] sm:w-[140px] lg:w-[196px] top-1 lg:top-[118px] -translate-x-1/2 z-10" },
]

/** Ngôi sao pixel hình chữ thập — chỉ hiện ở giao diện Pixel hồng. */
function PixelSparkle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 7 7" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <path className="fill-gold" d="M3 0h1v7H3zM0 3h7v1H0z" />
      <path fill="#FFFFFF" d="M3 3h1v1H3z" />
    </svg>
  )
}

const SPARKLES = [
  "left-[8%] top-[10%] h-5 w-5 lg:left-[10%] lg:top-[12%] lg:h-7 lg:w-7",
  "right-[9%] top-[6%] h-4 w-4 lg:right-[12%] lg:top-[16%] lg:h-5 lg:w-5",
  "right-[14%] bottom-[8%] h-3 w-3 lg:right-[16%] lg:bottom-[22%] lg:h-6 lg:w-6",
  "left-[16%] bottom-[4%] h-3 w-3 lg:left-[18%] lg:bottom-[20%] lg:h-4 lg:w-4",
]

/**
 * Ba lá Rider-Waite-Smith xoè quạt. Điện thoại: nằm trên tiêu đề.
 * Desktop: cột phải, đặt trên một "mặt bàn" có quầng sáng vàng nhẹ.
 */
export default function HeroFan() {
  return (
    <figure
      className="relative m-0 h-44 sm:h-60 lg:h-[600px] overflow-hidden
        lg:rounded-[28px] lg:border lg:border-mist/70 lg:bg-ink/70 lg:pixel:border-mist lg:pixel:pixel-shadow"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block bg-[radial-gradient(55%_45%_at_50%_52%,var(--hero-glow),transparent_70%)]"
      />
      {FAN.map((card) => (
        <div
          key={card.src}
          className={`absolute left-1/2 aspect-[3/5] overflow-hidden rounded-lg lg:rounded-xl
            shadow-[var(--fan-shadow)] pixel:border-2 pixel:border-mist ${card.className}`}
        >
          <Image src={card.src} alt="" fill unoptimized priority sizes="216px" className="object-cover" />
        </div>
      ))}
      {SPARKLES.map((s, i) => (
        <PixelSparkle key={i} className={`absolute hidden pixel:block ${s}`} />
      ))}
      <figcaption className="absolute left-7 bottom-6 hidden lg:block text-sm text-silver">
        {STRINGS.HERO_CAPTION}
      </figcaption>
    </figure>
  )
}
