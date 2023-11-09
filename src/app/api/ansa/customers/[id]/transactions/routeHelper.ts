import 'server-only'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { authUserRequestInComponent } from '../../../auth'
import { paths } from '../../../swagger/client'
import { AnsaAPIResponse } from '../../../types'
import {
  APITransactionsPaginated,
  apiTransactionsSchemaPaginated,
} from '../../../validation/schema'
import { queryParams } from './routeSchema'

export async function getCustomerTransactions(
  client: DBClient,
  customerId: string,
  query: queryParams = {}
): Promise<AnsaAPIResponse<APITransactionsPaginated>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getCustomerTransactionsNoUserAuth(
    query,
    customerId,
    data.merchantInfo.merchantSecretKey
  )
}

export async function getCustomerTransactionsNoUserAuth(
  query: queryParams,
  customerId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET(
      '/customers/{customerId}/transactions',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          path: {
            customerId,
          },
          query,
        },
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch customer transactions with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/transactions response is undefined`
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
        customerId: customerId,
        paymentMethodId: transaction.paymentMethodId,
        amount: transaction.amount,
        type: transaction.transactionType,
        createdAt: transaction.created,
      }
    })

    const transactionsObj = {
      nextCursor: data.nextCursor,
      results: internalTransactions,
      hasMore: data.hasMore,
    }
    const safeData = apiTransactionsSchemaPaginated.safeParse(transactionsObj)
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
