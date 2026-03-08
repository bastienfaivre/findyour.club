'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

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
  return (
    <AdminDirtyContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </AdminDirtyContext.Provider>
  )
}

export function useAdminDirty() {
  return useContext(AdminDirtyContext)
}
