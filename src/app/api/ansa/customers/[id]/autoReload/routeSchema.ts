import { z } from 'zod'

export const autoReloadBodySchema = z.object({
  enabled: z.boolean(),
  reloadAmount: z.number().max(100000).min(5).optional(),
  // TODO: allow configuring threshold
  // threshold: z.number().max(500).min(5),
  paymentMethodId: z.string().uuid().optional(),
})

export type AutoReloadBody = z.infer<typeof autoReloadBodySchema>
