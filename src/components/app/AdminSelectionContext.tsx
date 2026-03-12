'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AdminSelectionState {
  selectedApplicationId: string | null
  setSelectedApplicationId: (id: string | null) => void
  selectedClubId: string | null
  setSelectedClubId: (id: string | null) => void
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
  selectedUserId: string | null
  setSelectedUserId: (id: string | null) => void
}

const AdminSelectionContext = createContext<AdminSelectionState>({
  selectedApplicationId: null,
  setSelectedApplicationId: () => {},
  selectedClubId: null,
  setSelectedClubId: () => {},
  selectedConversationId: null,
  setSelectedConversationId: () => {},
  selectedUserId: null,
  setSelectedUserId: () => {},
})

export function AdminSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedApplicationId, setAppId] = useState<string | null>(null)
  const [selectedClubId, setClubId] = useState<string | null>(null)
  const [selectedConversationId, setConvId] = useState<string | null>(null)
  const [selectedUserId, setUId] = useState<string | null>(null)

  const setSelectedApplicationId = useCallback((id: string | null) => setAppId(id), [])
  const setSelectedClubId = useCallback((id: string | null) => setClubId(id), [])
  const setSelectedConversationId = useCallback((id: string | null) => setConvId(id), [])
  const setSelectedUserId = useCallback((id: string | null) => setUId(id), [])

  return (
    <AdminSelectionContext.Provider
      value={{
        selectedApplicationId,
        setSelectedApplicationId,
        selectedClubId,
        setSelectedClubId,
        selectedConversationId,
        setSelectedConversationId,
        selectedUserId,
        setSelectedUserId,
      }}
    >
      {children}
    </AdminSelectionContext.Provider>
  )
}

export function useAdminSelection() {
  return useContext(AdminSelectionContext)
}
