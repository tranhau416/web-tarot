/**
 * Logo: trăng lưỡi liềm và ngôi sao; giao diện Pixel hồng thay bằng trái tim pixel.
 * Màu lấy từ token nên tự đổi theo giao diện.
 */
export default function BrandMark({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <span className={`block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-full w-full pixel:hidden" fill="none">
        <circle cx="16" cy="16" r="14.5" className="stroke-gold" strokeOpacity="0.35" />
        <path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" className="fill-gold" />
        <path
          d="M23.5 8.5 L24.35 11.15 L27 12 L24.35 12.85 L23.5 15.5 L22.65 12.85 L20 12 L22.65 11.15 Z"
          className="fill-light"
        />
      </svg>
      <svg viewBox="0 0 16 16" className="hidden h-full w-full pixel:block" shapeRendering="crispEdges">
        <path
          className="fill-mist"
          d="M2 2h5v1H2zM9 2h5v1H9zM1 3h1v1H1zM7 3h1v1H7zM8 3h1v1H8zM14 3h1v1h-1zM0 4h1v4H0zM15 4h1v4h-1zM1 8h1v1H1zM14 8h1v1h-1zM2 9h1v1H2zM13 9h1v1h-1zM3 10h1v1H3zM12 10h1v1h-1zM4 11h1v1H4zM11 11h1v1h-1zM5 12h1v1H5zM10 12h1v1h-1zM6 13h1v1H6zM9 13h1v1H9zM7 14h2v1H7z"
        />
        <path
          className="fill-gold"
          d="M2 3h5v1H2zM9 3h5v1H9zM1 4h14v4H1zM2 8h12v1H2zM3 9h10v1H3zM4 10h8v1H4zM5 11h6v1H5zM6 12h4v1H6zM7 13h2v1H7z"
        />
        <path fill="#FFFFFF" d="M2 4h2v1H2zM2 5h1v1H2z" />
      </svg>
    </span>
  )
}
