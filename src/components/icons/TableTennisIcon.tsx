import type { SVGProps } from 'react'

export function TableTennisIcon({ className, strokeWidth = 1.5, ...props }: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5 20 20" />
      <circle cx="21" cy="21" r="1.5" />
    </svg>
  )
}
