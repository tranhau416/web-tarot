import Image from "next/image"
import { STRINGS } from "@/app/lib/strings"

const SIDE = "w-[92px] sm:w-32 lg:w-[172px] top-[22px] sm:top-5 lg:top-[150px]"
const FAN = [
  { src: "/cards/00-the-fool.webp", className: `${SIDE} -translate-x-[116%] -rotate-[10deg]` },
  { src: "/cards/21-the-world.webp", className: `${SIDE} translate-x-[16%] rotate-[10deg]` },
  { src: "/cards/17-the-star.webp", className: "w-[100px] sm:w-[140px] lg:w-[196px] top-1 lg:top-[118px] -translate-x-1/2 z-10" },
]

/**
 * Ba lá Rider-Waite-Smith xoè quạt. Điện thoại: nằm trên tiêu đề.
 * Desktop: cột phải, đặt trên một "mặt bàn" có quầng sáng vàng nhẹ.
 */
export default function HeroFan() {
  return (
    <figure
      className="relative m-0 h-44 sm:h-60 lg:h-[600px] overflow-hidden
        lg:rounded-[28px] lg:border lg:border-mist/70 lg:bg-ink/70"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block bg-[radial-gradient(55%_45%_at_50%_52%,rgb(242_193_78/0.16),transparent_70%)]"
      />
      {FAN.map((card) => (
        <div
          key={card.src}
          className={`absolute left-1/2 aspect-[3/5] overflow-hidden rounded-lg lg:rounded-xl
            shadow-[0_20px_44px_rgba(0,0,0,0.55)] ${card.className}`}
        >
          <Image src={card.src} alt="" fill unoptimized priority sizes="216px" className="object-cover" />
        </div>
      ))}
      <figcaption className="absolute left-7 bottom-6 hidden lg:block text-sm text-silver">
        {STRINGS.HERO_CAPTION}
      </figcaption>
    </figure>
  )
}
