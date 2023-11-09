import 'server-only'

import { authUserRequestInComponent } from '@/app/api/ansa/auth'
import { paths } from '@/app/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/app/api/ansa/types'
import {
  APITransaction,
  apiTransactionSchema,
} from '@/app/api/ansa/validation/schema'
import { InternalError, NotFoundError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'

export async function getSingleTransaction(
  client: DBClient,
  transactionId: string
): Promise<AnsaAPIResponse<APITransaction>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getSingleTransactionNoUserAuth(
    transactionId,
    data.merchantInfo.merchantSecretKey
  )
}

export async function getSingleTransactionNoUserAuth(
  transactionId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: transaction, response } = await ansaClient.GET(
      '/transactions/{transactionId}',
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
    if (response.status >= 500) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch customer transaction with id: ${transactionId}`
        ),
      }
    }
    if (response.status == 404) {
      return {
        data: null,
        error: new NotFoundError('No transaction found with that id'),
      }
    }
    if (!isDefined(transaction)) {
      return {
        data: null,
        error: new InternalError(
          `GET /transactions/${transactionId}/ response is undefined`
        ),
      }
    }
    const internalTransactions = {
      id: transaction.transactionId,
      customerId: transaction.customerId,
      label: transaction.label,
      paymentMethodId: transaction.paymentMethodId,
      amount: transaction.amount,
      type: transaction.transactionType,
      createdAt: transaction.created,
    }
    const safeData = apiTransactionSchema.safeParse(internalTransactions)
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
