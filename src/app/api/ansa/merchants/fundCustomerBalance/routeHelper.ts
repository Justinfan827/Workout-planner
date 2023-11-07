import 'server-only'

import createClient from 'openapi-fetch'

import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { InternalError } from '../../../errors'
import { authUserRequestInComponent } from '../../auth'
import { paths } from '../../swagger/client'
import { AnsaAPIResponse } from '../../types'
import {
  APIFundedBalance,
  apiFundedBalanceSchema,
} from '../../validation/schema'
import { FundCustomerBalanceBody } from './routeSchema'

export async function fundCustomerBalance(
  client: DBClient,
  payload: FundCustomerBalanceBody
): Promise<AnsaAPIResponse<APIFundedBalance>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return fundCustomerBalanceInternal(
    payload,
    data.merchantInfo.merchantSecretKey
  )
}

export async function fundCustomerBalanceInternal(
  payload: FundCustomerBalanceBody,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: fundResponse, response } = await ansaClient.POST(
      '/fund-customer-balance',
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
        error: new InternalError('Could not fund customer balance'),
      }
    }
    if (!isDefined(fundResponse)) {
      return {
        data: null,
        error: new InternalError(
          'POST /fund-customer-balance response is undefined'
        ),
      }
    }
    const internalFundedBalance = {
      customerId: fundResponse.customerId,
      timestamp: fundResponse.timestamp,
      transactionId: fundResponse.transactionId,
      currentBalance: {
        amount: fundResponse.currentBalance.amount,
        currency: fundResponse.currentBalance.currency,
      },
    }
    const customerResult = apiFundedBalanceSchema.safeParse(
      internalFundedBalance
    )
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
