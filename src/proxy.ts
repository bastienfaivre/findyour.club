// src/proxy.ts
// Placeholder — full auth guards are implemented in Story 1.4: Platform Operator Authentication & Admin Route Protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
