import 'server-only'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { AuthResponseData, authUserRequestInComponent } from '../auth'
import { paths } from '../swagger/client'
import { AnsaAPIResponse } from '../types'
import {
  APITransactionsPaginated,
  apiTransactionsSchemaPaginated,
} from '../validation/schema'
import { queryParams } from './routeSchema'

export async function getMerchantTransactions(
  client: DBClient,
  query: queryParams = {}
): Promise<AnsaAPIResponse<APITransactionsPaginated>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getMerchantTransactionsInternal(query, data.merchantInfo)
}

async function getMerchantTransactionsInternal(
  query: queryParams,
  { merchantSecretKey, merchantId }: AuthResponseData['merchantInfo']
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET('/transactions', {
      headers: {
        Authorization: merchantSecretKey,
      },
      params: {
        query,
      },
    })
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch merchant transactions with id: ${merchantId}`
        ),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/transactions response is undefined`
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
        paymentMethodId: transaction.paymentMethodId,
        amount: transaction.amount,
        type: transaction.transactionType,
        createdAt: transaction.created,
        customerId: transaction.customerId,
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
