import * as z from 'zod'

export const bodySchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']),
})

export type BodyParams = z.infer<typeof bodySchema>
