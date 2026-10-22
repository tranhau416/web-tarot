"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/** Liên kết điều hướng có trạng thái "đang ở trang này" (aria-current). */
export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const active = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center min-h-11 px-4 rounded-[10px] text-[15px] font-medium whitespace-nowrap transition-colors
        ${active ? "text-light bg-veil" : "text-pearl hover:text-light hover:bg-veil"}`}
    >
      {children}
    </Link>
  )
}
