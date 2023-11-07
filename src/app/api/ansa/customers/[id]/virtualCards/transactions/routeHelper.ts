import 'server-only'

import { authUserRequestInComponent } from '@/app/api/ansa/auth'
import { paths } from '@/app/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/app/api/ansa/types'
import {
  APIVirtualCardTransactionsPaginated,
  apiVirtualCardTransactionsPaginatedSchema,
} from '@/app/api/ansa/validation/schema'
import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { queryParams } from './routeSchema'

export async function getCustomerVirtualCardTransactions(
  client: DBClient,
  customerId: string,
  query: queryParams
): Promise<AnsaAPIResponse<APIVirtualCardTransactionsPaginated>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return fetch(customerId, data.merchantInfo.merchantSecretKey, query)
}

async function fetch(
  customerId: string,
  merchantSecretKey: string,
  query: queryParams
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: txns, response } = await ansaClient.GET(
      '/customers/{customerId}/virtual-card/transactions',
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
          `Could not fetch customer virtual card transactions with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(txns)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/virtual-card/transactions response is undefined`
        ),
      }
    }
    const internalVirtualCardTxns = txns.transactions.map((txn) => {
      return {
        id: txn.id,
        acceptorId: txn.acceptorId,
        status: txn.status,
        authorizationAmount: txn.authorizationAmount,
        decision: txn.decision,
        created: txn.created,
      }
    })

    const paginatedResponse = {
      hasMore: txns.hasMore,
      nextCursor: txns.nextCursor,
      results: internalVirtualCardTxns,
    }

    const txnResult =
      apiVirtualCardTransactionsPaginatedSchema.safeParse(paginatedResponse)

    if (!txnResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: txnResult.error,
        }),
      }
    }
    return { data: txnResult.data, error: null }
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
