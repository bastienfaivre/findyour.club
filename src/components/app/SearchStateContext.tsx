'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const SearchStateContext = createContext<{
  searchQuery: string
  setSearchQuery: (qs: string) => void
}>({ searchQuery: '', setSearchQuery: () => {} })

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQueryState] = useState('')
  const setSearchQuery = useCallback((qs: string) => setSearchQueryState(qs), [])
  return (
    <SearchStateContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchStateContext.Provider>
  )
}

export function useSearchState() {
  return useContext(SearchStateContext)
}
