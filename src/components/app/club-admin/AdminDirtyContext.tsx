'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface AdminDirtyContextValue {
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const AdminDirtyContext = createContext<AdminDirtyContextValue>({
  isDirty: false,
  setIsDirty: () => {},
})

export function AdminDirtyProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  const value = useMemo(() => ({ isDirty, setIsDirty }), [isDirty])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return (
    <AdminDirtyContext.Provider value={value}>
      {children}
    </AdminDirtyContext.Provider>
  )
}

export function useAdminDirty() {
  return useContext(AdminDirtyContext)
}
