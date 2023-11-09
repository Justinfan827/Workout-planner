import { paths } from '@/app/api/ansa/swagger/client'
import logSymbols from 'log-symbols'
import createAnsaClient from 'openapi-fetch'
import { infoLog } from '../../../utils'
import {
  addBalance,
  createCustomer,
  createPaymentMethod,
  refundBalance,
  useBalance,
} from '../../ansa/creation'

export async function customerScenario1(
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  merchantSecretKey: string
) {
  const customer1 = await createCustomer(ansaClient, merchantSecretKey)
  const paymentMethod1 = await createPaymentMethod(
    ansaClient,
    customer1.id,
    merchantSecretKey
  )

  await Promise.all([
    addBalance(ansaClient, customer1.id, paymentMethod1.id, merchantSecretKey, {
      amount: 5000,
    }),
    addBalance(ansaClient, customer1.id, paymentMethod1.id, merchantSecretKey, {
      amount: 5000,
    }),
    addBalance(ansaClient, customer1.id, paymentMethod1.id, merchantSecretKey, {
      amount: 5000,
    }),
    addBalance(ansaClient, customer1.id, paymentMethod1.id, merchantSecretKey, {
      amount: 5000,
    }),
  ])

  const [useBalance1, useBalance2, useBalance3, useBalance4] =
    await Promise.all([
      useBalance(ansaClient, customer1.id, merchantSecretKey, {
        amount: 1000,
      }),
      useBalance(ansaClient, customer1.id, merchantSecretKey, {
        amount: 500,
      }),
      useBalance(ansaClient, customer1.id, merchantSecretKey, {
        amount: 1000,
      }),
      useBalance(ansaClient, customer1.id, merchantSecretKey, {
        amount: 500,
      }),
    ])

  await Promise.all([
    // full refunds
    refundBalance(ansaClient, useBalance1.transactionId, merchantSecretKey, {
      amount: 1000,
    }),
    refundBalance(ansaClient, useBalance3.transactionId, merchantSecretKey, {
      amount: 500,
    }),
    // partial refunds
    refundBalance(ansaClient, useBalance2.transactionId, merchantSecretKey, {
      amount: 500,
    }),
    refundBalance(ansaClient, useBalance4.transactionId, merchantSecretKey, {
      amount: 100,
    }),
  ])
  infoLog(logSymbols.success, `created customer: ${customer1.id}`)
  return customer1.id
}
