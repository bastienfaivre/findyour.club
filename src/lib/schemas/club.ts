import { z } from 'zod'

// Stub schema for club profile save — full fields will be defined when profile edit form is implemented
export const clubProfileSaveSchema = z.object({
  name: z.string().min(1).max(200).optional(),
})

export type ClubProfileSaveInput = z.infer<typeof clubProfileSaveSchema>
