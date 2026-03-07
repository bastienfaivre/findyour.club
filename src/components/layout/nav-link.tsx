'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function NavLink({ href, className, children }: NavLinkProps) {
  const pathname = usePathname()
  const isCurrent = pathname === href

  return (
    <Link
      href={href}
      aria-current={isCurrent ? 'page' : undefined}
      className={className}
    >
      {children}
    </Link>
  )
}
