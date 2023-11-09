import 'server-only'

import { InternalError, NotFoundError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'

import { authUserRequestInComponent } from '../../auth'
import { paths } from '../../swagger/client'
import { AnsaAPIResponse } from '../../types'
import {
  APICustomerDetailed,
  apiCustomerDetailedSchema,
} from '../../validation/schema'

export async function getSingleAnsaCustomer(
  client: DBClient,
  customerId: string
): Promise<AnsaAPIResponse<APICustomerDetailed>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getSingleAnsaCustomerNoUserAuth(
    customerId,
    data.merchantInfo.merchantSecretKey
  )
}

async function getSingleAnsaCustomerNoUserAuth(
  customerId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: customer, response } = await ansaClient.GET(
      '/customers/{customerId}',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          path: {
            customerId,
          },
          query: {
            details: true,
          },
        },
      }
    )

    const res = await response.json()
    if (response.status === 400 && res?.code === 'invalid_customer_id') {
      return {
        data: null,
        error: new NotFoundError(
          `Could not find customer with id: ${customerId}`
        ),
      }
    }

    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch customer with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(customer)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId} response is undefined`
        ),
      }
    }
    const internalCustomer = {
      id: customer.id,
      email: customer.email,
      firstName: customer.billingDetails?.firstName,
      lastName: customer.billingDetails?.lastName,
      phone: customer.phone,
      status: customer.status,
      ansaMetadata: customer.ansaMetadata,
      metadata: customer.metadata,
      balance: customer.balance,
    }

    const customerResult = apiCustomerDetailedSchema.safeParse(internalCustomer)
    if (!customerResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: customerResult.error,
        }),
      }
    }
    return { data: customerResult.data, error: null }
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
