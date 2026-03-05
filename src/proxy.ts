// src/proxy.ts
// Central routing / proxy logic. All request-level rules live here.
// Auth is enforced exclusively at the layout level (no edge-layer auth guards).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
