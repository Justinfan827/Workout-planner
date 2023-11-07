import * as z from 'zod'
import { apiTransactionTypesSchema } from '../../../validation/schema'

export const queryParamsSchema = z.object({
  limit: z.number().int().optional(),
  cursor: z.string().optional(),
  transactionType: apiTransactionTypesSchema.optional(),
  createdAtOrBefore: z.string().optional(),
  createdAtOrAfter: z.string().optional(),
  label: z.string().optional(),
  direction: z.enum(['forward', 'backward']).optional(),
})

export type queryParams = z.infer<typeof queryParamsSchema>
