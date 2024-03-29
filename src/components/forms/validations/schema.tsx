import * as z from 'zod'

export const authSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z
    .string()
    .min(6, {
      message: 'Password must be at least 8 characters long',
    })
    .max(100)
    .optional(),
})
