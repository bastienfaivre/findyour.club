import { z } from 'zod'

export const clubProfileSaveSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  schedule: z.string().max(2000).nullable(),
  howToJoin: z.string().max(2000).nullable(),
  contactPhone: z.string().max(20).nullable(),
  contactAddress: z.string().max(500).nullable(),
  externalWebsiteUrl: z.union([z.string().url(), z.literal('')]).nullable(),
})

export type ClubProfileSaveInput = z.infer<typeof clubProfileSaveSchema>
