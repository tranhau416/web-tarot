import Image from "next/image"

const FAN = [
  { src: "/cards/00-the-fool.webp", tilt: "-rotate-[14deg] -translate-x-[70%]" },
  { src: "/cards/17-the-star.webp", tilt: "-translate-x-1/2 -translate-y-2 z-10" },
  { src: "/cards/21-the-world.webp", tilt: "rotate-[14deg] -translate-x-[30%]" },
]

/** Ba lá Rider-Waite-Smith xoè quạt — hình ảnh mở đầu thay cho emoji. */
export default function HeroFan() {
  return (
    <div className="relative mx-auto h-28 w-48 sm:h-40 sm:w-64" aria-hidden="true">
      {FAN.map((card) => (
        <div
          key={card.src}
          className={`absolute bottom-0 left-1/2 w-16 sm:w-24 aspect-[3/5] origin-bottom rounded-lg overflow-hidden
            border-2 border-mist shadow-[0_12px_30px_rgba(0,0,0,0.55)] ${card.tilt}`}
        >
          <Image src={card.src} alt="" fill unoptimized priority sizes="96px" className="object-cover" />
        </div>
      ))}
    </div>
  )
}
