import * as z from 'zod'

export const queryParamsSchema = z.object({
  limit: z.number().int().optional(),
  cursor: z.string().optional(),
  direction: z.enum(['backward', 'forward']).optional(),
})

export type queryParams = z.infer<typeof queryParamsSchema>
