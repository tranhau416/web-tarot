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
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors
        ${active ? "text-light bg-veil" : "text-silver hover:text-pearl hover:bg-veil"}`}
    >
      {children}
    </Link>
  )
}
