import * as z from 'zod'
import { apiTransactionTypesSchema } from '../../validation/schema'

export const queryParamsSchema = z.object({
  cursor: z.string().optional(),
  customerId: z.string().optional(),
  transactionType: apiTransactionTypesSchema.optional(),
  createdAtOrBefore: z.string().optional(),
  createdAtOrAfter: z.string().optional(),
  label: z.string().optional(),
})

export type queryParams = z.infer<typeof queryParamsSchema>
