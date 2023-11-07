import * as z from 'zod'

export const apiCustomerSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(), // TODO: consider being more strict with what emails are allowed
  status: z.string(),
  phone: z.string().optional(),
})

export const apiCountSchema = z.object({
  totalCount: z.number(),
})

export const apiCustomerDetailedSchema = apiCustomerSchema.extend({
  ansaMetadata: z.record(z.string(), z.any()).nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  balance: z.object({
    currency: z.string(),
    amount: z.number(),
  }),
})

export const apiCustomersPaginatedSchema = z.object({
  hasMore: z.boolean(),
  cursor: z.string(),
  results: z.array(apiCustomerSchema),
})

export const apiAdminMerchantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})
export const apiAdminMerchantArraySchema = z.array(apiAdminMerchantSchema)

export const apiMerchantInsights = z.object({
  totalCustomerAddedBalance: z.number(),
  totalMerchantFundedBalance: z.number(),
  totalCustomerBalance: z.number(),
  totalSettledBalance: z.number(),
  totalUsers: z.number(),
})

export const apiMerchantSchema = apiAdminMerchantSchema.extend({
  metadata: z.object({
    autoReloadConfig: z.object({
      maximumReloadAmount: z.number(),
      minimumReloadAmount: z.number(),
      minimumReloadThreshold: z.number(),
    }),
    promotionConfig: z
      .object({
        type: z.enum(['first_top_up', 'once_per_tier', 'tiered']),
        rewardTiers: z.array(
          z.object({
            minTransactionRequirement: z.number(),
            promotionAmount: z.number(),
          })
        ),
      })
      .optional(),
  }),
})

export const apiPaymentMethodSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  brand: z.enum([
    'amex',
    'diners',
    'discover',
    'jcb',
    'mastercard',
    'unionpay',
    'visa',
    'unknown',
  ]),
  lastFour: z.string(),
})

export const apiPaymentMethodArraySchema = z.array(apiPaymentMethodSchema)

export const apiAutoReloadSchema = z.object({
  enabled: z.boolean(),
  paymentMethodId: z.string().optional(),
  reloadAmount: z.number().optional(),
  reloadThreshold: z.number().optional(),
})

export const apiVisibleTransactionTypes = [
  'add_balance',
  'use_balance',
  'merchant_refund',
  'merchant_add_promo',
  'open_dispute',
  'card_authorize_transaction',
  'card_force_authorize_transaction',
  'card_return_transaction',
] as const

export const apiTransactionTypesSchema = z.enum(apiVisibleTransactionTypes)

export const apiTransactionSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  paymentMethodId: z.string().optional(),
  label: z.string().optional(),
  createdAt: z.string(),
  amount: z.number(),
  type: apiTransactionTypesSchema,
})

export const apiTransactionsSchema = z.array(apiTransactionSchema)

export const apiTransactionsSchemaPaginated = z.object({
  results: z.array(apiTransactionSchema),
  nextCursor: z.string(),
  hasMore: z.boolean(),
})

export const apiFundedBalanceSchema = z.object({
  currentBalance: z.object({
    amount: z.number(),
    currency: z.enum(['usd', 'USD']),
  }),
  customerId: z.string().uuid(),
  timestamp: z.string(),
  transactionId: z.string().uuid(),
})

export const apiRefundSchema = z.object({
  amount: z.number(),
  createdAt: z.string(),
  currency: z.enum(['usd', 'USD']),
  customerId: z.string().uuid(),
  id: z.string().uuid(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  reason: z.string().optional(),
  status: z.enum(['succeeded']),
  transactionId: z.string().uuid(),
  type: z.enum(['balance', 'payment_method', 'promotion']),
})

export const apiVirtualCard = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  createdAt: z.string().datetime(),
  type: z.string(),
  card: z.object({
    lastFour: z.string(),
    expMonth: z.string(),
    expYear: z.string(),
    cardHolderName: z.string(),
    cardNetwork: z.enum(['mastercard', 'visa']),
    state: z.enum(['OPEN', 'PAUSED', 'CLOSED']),
  }),
})

export const apiVirtualCardTransactionSchema = z.object({
  id: z.string().uuid(),
  acceptorId: z.string(),
  authorizationAmount: z.number(),
  created: z.string(),
  decision: z.string(),
  status: z.string(),
})

export const apiVirtualCardTransactionsPaginatedSchema = z.object({
  results: z.array(apiVirtualCardTransactionSchema),
  nextCursor: z.string(),
  hasMore: z.boolean(),
})

export type APIVirtualCard = z.infer<typeof apiVirtualCard>
export type APIAdminMerchants = z.infer<typeof apiAdminMerchantArraySchema>
export type APIAutoReload = z.infer<typeof apiAutoReloadSchema>
export type APICustomer = z.infer<typeof apiCustomerSchema>
export type APICustomerDetailed = z.infer<typeof apiCustomerDetailedSchema>
export type APICustomersPaginated = z.infer<typeof apiCustomersPaginatedSchema>
export type APIFundedBalance = z.infer<typeof apiFundedBalanceSchema>
export type APIMerchant = z.infer<typeof apiMerchantSchema>
export type APIMerchantInsights = z.infer<typeof apiMerchantInsights>
export type APIPaymentMethod = z.infer<typeof apiPaymentMethodSchema>
export type APIPaymentMethods = z.infer<typeof apiPaymentMethodArraySchema>
export type APIRefund = z.infer<typeof apiRefundSchema>
export type APITransaction = z.infer<typeof apiTransactionSchema>
export type APITransactionType = z.infer<typeof apiTransactionTypesSchema>
export type APITransactions = z.infer<typeof apiTransactionsSchema>
export type APITransactionsPaginated = z.infer<
  typeof apiTransactionsSchemaPaginated
>
export type APIVirtualCardTransaction = z.infer<
  typeof apiVirtualCardTransactionSchema
>

export type APIVirtualCardTransactionsPaginated = z.infer<
  typeof apiVirtualCardTransactionsPaginatedSchema
>
export type APICount = z.infer<typeof apiCountSchema>
