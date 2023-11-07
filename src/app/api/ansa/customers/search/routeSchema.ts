import * as z from 'zod'

export const queryParamsSchema = z.object({
  customerId: z.string().uuid().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
})

export type queryParams = z.infer<typeof queryParamsSchema>
