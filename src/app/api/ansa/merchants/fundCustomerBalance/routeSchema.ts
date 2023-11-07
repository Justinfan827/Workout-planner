import { z } from 'zod'

export const fundCustomerBalanceBodySchema = z.object({
  amount: z.number(),
  currency: z.enum(['usd', 'USD']),
  customerId: z.string(),
  reason: z.string().optional(),
})

export type FundCustomerBalanceBody = z.infer<
  typeof fundCustomerBalanceBodySchema
>
