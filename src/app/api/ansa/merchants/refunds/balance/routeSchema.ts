import { z } from 'zod'

export const refundSchema = z.object({
  amount: z.number(),
  currency: z.enum(['usd', 'USD']),
  transactionId: z.string().uuid(),
})

export type RefundBody = z.infer<typeof refundSchema>
