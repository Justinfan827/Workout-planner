import { components, paths } from '@/app/api/ansa/swagger/client'
import {
  randEmail,
  randFirstName,
  randLastName,
  randNumber,
} from '@ngneat/falso'
import createAnsaClient from 'openapi-fetch'

export const createMerchant = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  merchantName: string,
  ansaAdminApiKey: string
) => {
  // create merchant
  const { data, response, error } = await ansaClient.POST(
    '/internal-admin/merchants',
    {
      body: {
        name: merchantName,
        defaultPaymentProcessor: 'square',
        squareAppClientId: 'sandbox-sq0idb-KNXVZ7vy3I-xSXyPX9rT-w',
        squareAppClientSecret:
          'sandbox-sq0csb-GZ8zK5aEuxSFIl_aPHL2-VoZ5rpvyCNxI00K0m2J2s4',
        squareAccessToken:
          'EAAAEBrLBPioqgVqjrXNHL63zwYqwXOBKXNOuwQsRttpy4GHf2oUEbmF3SC7iUTT',
      },
      headers: {
        Authorization: ansaAdminApiKey,
      },
    }
  )
  if (error) {
    throw new Error(error.message)
  }
  if (!response.ok) {
    throw new Error('not ok from ansa merchant creation')
  }

  if (!data) {
    throw new Error('not ok from ansa merchant creation')
  }
  return {
    merchantId: data.merchantId!,
    merchantSecretKey: data.merchantSecretKey!,
  }
}
export const createPaymentMethod = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  customerId: string,
  merchantSecretKey: string
) => {
  const {
    data: paymentMethod1,
    response: paymentMethod1Response,
    error: paymentMethod1Err,
  } = await ansaClient.POST('/customers/{customerId}/payment-methods', {
    body: paymentMethodBody(),
    params: { path: { customerId } },
    headers: {
      Authorization: merchantSecretKey,
    },
  })
  if (paymentMethod1Err) {
    throw new Error(paymentMethod1Err.message)
  }
  if (!paymentMethod1Response.ok) {
    throw new Error('not ok from ansa payment method creation')
  }

  return {
    id: paymentMethod1.id!,
  }
}

export const createCustomer = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  merchantSecretKey: string
) => {
  // create customers
  const { data, response, error } = await ansaClient.POST('/customers', {
    body: fakeCustomerBody(),
    headers: {
      Authorization: merchantSecretKey,
    },
  })
  if (error) {
    throw new Error(error.message)
  }
  if (!response.ok) {
    throw new Error('not ok from ansa customer creation')
  }

  return {
    id: data.id!,
  }
}

export const refundBalance = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  transactionId: string,
  merchantSecretKey: string,
  opts: { amount: number } = { amount: 5000 }
) => {
  const { response, error } = await ansaClient.POST('/refunds/balance', {
    body: {
      transactionId,
      amount: opts.amount,
    },
    headers: {
      Authorization: merchantSecretKey,
    },
  })
  if (error) {
    throw new Error(error.message)
  }
  if (!response.ok) {
    throw new Error('not ok from ansa use balance')
  }
}

export const useBalance = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  customerId: string,
  merchantSecretKey: string,
  opts: { amount: number; label?: string } = { amount: 5000 }
) => {
  const { data, response, error } = await ansaClient.POST(
    '/customers/{customerId}/use-balance',
    {
      body: {
        amount: opts.amount,
        ...(opts.label && { label: opts.label }),
      },
      params: {
        path: {
          customerId,
        },
      },
      headers: {
        Authorization: merchantSecretKey,
      },
    }
  )
  if (error) {
    throw new Error(error.message)
  }
  if (!response.ok) {
    throw new Error('not ok from ansa use balance')
  }
  return data
}

export const addBalance = async (
  ansaClient: ReturnType<typeof createAnsaClient<paths>>,
  customerId: string,
  paymentMethodId: string,
  merchantSecretKey: string,
  opts: { amount: number } = { amount: 5000 }
) => {
  const { data, response, error } = await ansaClient.POST(
    '/customers/{customerId}/add-balance',
    {
      body: addBalanceBody(paymentMethodId, opts.amount),
      params: {
        path: {
          customerId,
        },
      },
      headers: {
        Authorization: merchantSecretKey,
      },
    }
  )
  if (error) {
    throw new Error(error.message)
  }
  if (!response.ok) {
    throw new Error('not ok from ansa add balance')
  }

  return data
}

const fakeCustomerBody: () => components['schemas']['customer__create_customer_args'] =
  () => {
    return {
      billingDetails: {
        firstName: randFirstName(),
        lastName: randLastName(),
        address: {
          city: 'dolore laboris nisi',
          country: 'US',
          line1: 'dolore non minim',
          postalCode: '94107',
          state: 'exercitation aute amet enim',
          line2: 'velit dolor',
        },
      },
      email: randEmail(),
      phone: `53053${randNumber({ min: 10000, max: 99999 })}`,
    }
  }

const paymentMethodBody: () => components['schemas']['customer__create_payment_method_args'] =
  () => {
    return {
      token: 'cnon:card-nonce-ok',
      tokenSource: 'square',
      metadata: {
        nonf: {},
      },
      tokenData: {},
    }
  }

const addBalanceBody: (
  paymentMethodId: string,
  amount: number
) => components['schemas']['customer__add_balance_args'] = (
  paymentMethodId,
  amount
) => {
  return {
    paymentMethodId,
    amount,
    currency: 'USD',
  }
}
