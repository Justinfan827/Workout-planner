import { z } from 'zod'

export const updateMerchantBodySchema = z.object({
  promoConfig: z
    .object({
      promotionType: z.enum(['first_top_up', 'once_per_tier', 'tiered']),
      tiers: z
        .array(
          z.object({
            // these are in cents
            minTransactionRequirement: z.number().min(100).max(99999),
            promotionAmount: z.number().min(1).max(25000),
          })
        )
        .min(1)
        .max(5),
    })
    .nullable(),
})

export type UpdateMerchantBody = z.infer<typeof updateMerchantBodySchema>
