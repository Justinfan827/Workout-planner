import 'server-only'

import { authUserRequestInComponent } from '@/app/api/ansa/auth'
import { paths } from '@/app/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/app/api/ansa/types'
import {
  APITransactions,
  apiTransactionsSchema,
} from '@/app/api/ansa/validation/schema'
import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'

export async function getTransactionRefunds(
  client: DBClient,
  transactionId: string,
  customerId?: string
): Promise<AnsaAPIResponse<APITransactions>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getTransactionRefundsInternal(
    transactionId,
    data.merchantInfo.merchantSecretKey,
    customerId
  )
}

async function getTransactionRefundsInternal(
  transactionId: string,
  merchantSecretKey: string,
  customerId?: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET(
      '/transactions/{transactionId}/refunds',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          path: {
            transactionId,
          },
        },
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch transaction refunds for transaction: ${transactionId}`
        ),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${transactionId}/refunds response is undefined`
        ),
      }
    }
    const internalTransactions = data.transactions.map((transaction) => {
      if (!transaction.created) {
        return {
          data: null,
          error: new InternalError('No created date on transaction'),
        }
      }
      return {
        id: transaction.transactionId,
        customerId: customerId, // TODO: should this return customer ID as well?
        paymentMethodId: transaction.paymentMethodId,
        amount: transaction.amount,
        type: transaction.transactionType,
        createdAt: transaction.created,
      }
    })
    const safeData = apiTransactionsSchema.safeParse(internalTransactions)
    if (!safeData.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: safeData.error,
        }),
      }
    }
    return { data: safeData.data, error: null }
  } catch (e) {
    if (e instanceof Error) {
      return {
        data: null,
        error: new InternalError('Ansa API network issue', { cause: e }),
      }
    }
    return {
      data: null,
      error: new InternalError('Unknown error'),
    }
  }
}
