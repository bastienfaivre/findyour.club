import { DefaultSession } from 'next-auth'
import { UserRole, ClubMemberRole } from '@/generated/prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      totpEnabled: boolean
      totpVerified: boolean
      // Club context — null at login, populated by club layout membership check
      clubId: string | null
      clubRole: ClubMemberRole | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: UserRole
    totpEnabled: boolean
  }
}
