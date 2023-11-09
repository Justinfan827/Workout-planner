import 'server-only'

import createClient from 'openapi-fetch'

import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { InternalError } from '../../../../errors'
import { authUserRequestInComponent } from '../../../auth'
import { paths } from '../../../swagger/client'
import { AnsaAPIResponse } from '../../../types'
import { APIRefund, apiRefundSchema } from '../../../validation/schema'
import { RefundBody } from './routeSchema'

/**
 * This can be used directly in server components.
 **/
export async function refundBalance(
  client: DBClient,
  payload: RefundBody
): Promise<AnsaAPIResponse<APIRefund>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return refundBalanceNoUserAuth(payload, data.merchantInfo.merchantSecretKey)
}

export async function refundBalanceNoUserAuth(
  payload: RefundBody,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: refundResponse, response } = await ansaClient.POST(
      '/refunds/balance',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        body: payload,
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not refund balance'),
      }
    }
    if (!isDefined(refundResponse)) {
      return {
        data: null,
        error: new InternalError('POST /refunds/balance response is undefined'),
      }
    }
    const internalRefund = {
      amount: refundResponse.amount,
      createdAt: refundResponse.created,
      currency: refundResponse.currency,
      customerId: refundResponse.customerId,
      id: refundResponse.id,
      metadata: refundResponse.metadata,
      reason: refundResponse.reason,
      status: refundResponse.status,
      transactionId: refundResponse.transactionId,
      type: refundResponse.type,
    }
    const customerResult = apiRefundSchema.safeParse(internalRefund)
    if (!customerResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: customerResult.error,
        }),
      }
    }
    return {
      data: customerResult.data,
      error: null,
    }
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
