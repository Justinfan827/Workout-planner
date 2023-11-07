import 'server-only'

import createClient from 'openapi-fetch'

import { authUserRequestInComponent } from '@/api/ansa/auth'
import { paths } from '@/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/api/ansa/types'
import { APICustomer, apiCustomerSchema } from '@/api/ansa/validation/schema'
import { InternalError } from '@/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { z } from 'zod'
import { queryParams } from './routeSchema'

export async function searchAnsaCustomers(
  client: DBClient,
  query: queryParams = {}
): Promise<AnsaAPIResponse<APICustomer[]>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return searchAnsaCustomersInternal(query, data.merchantInfo.merchantSecretKey)
}

export async function searchAnsaCustomersInternal(
  query: queryParams,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: customer, response } = await ansaClient.GET(
      '/customers/search',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          query,
        },
      }
    )
    if (response.status === 404) {
      return {
        data: [],
        error: null,
      }
    }
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not fetch customers'),
      }
    }
    if (!isDefined(customer)) {
      return {
        data: null,
        error: new InternalError('GET /customers/search response is undefined'),
      }
    }
    const internalCustomers = [
      {
        id: customer.id,
        email: customer.email,
        firstName: customer.billingDetails?.firstName,
        lastName: customer.billingDetails?.lastName,
        phone: customer.phone,
        status: customer.status,
      },
    ]
    const customerResult = z
      .array(apiCustomerSchema)
      .safeParse(internalCustomers)
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
