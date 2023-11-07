import 'server-only'

import createClient from 'openapi-fetch'

import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { InternalError } from '../../errors'
import { authUserRequestInComponent } from '../auth'
import { paths } from '../swagger/client'
import { AnsaAPIResponse } from '../types'
import {
  APICustomersPaginated,
  apiCustomersPaginatedSchema,
} from '../validation/schema'
import { queryParams } from './routeSchema'

/**
 * Fetch the customer list for a given merchant.
 * Requires the user to be signed in.
 * Can be used directly in server components.
 **/
export async function getAnsaCustomers(
  client: DBClient,
  query: queryParams = {}
): Promise<AnsaAPIResponse<APICustomersPaginated>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getAnsaCustomersInternal(query, data.merchantInfo.merchantSecretKey)
}

export async function getAnsaCustomersInternal(
  query: queryParams,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: customersList, response } = await ansaClient.GET(
      '/customers',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          query,
        },
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not fetch customers from ansa', {
          labels: {
            ansaStatusCode: response.status,
          },
        }),
      }
    }
    if (!isDefined(customersList)) {
      return {
        data: null,
        error: new InternalError('GET /customers response is undefined'),
      }
    }
    const internalCustomers = customersList.customers.map((customer) => {
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.billingDetails?.firstName,
        lastName: customer.billingDetails?.lastName,
        phone: customer.phone,
        status: customer.status,
      }
    })
    const customersArr = {
      hasMore: customersList.hasMore,
      cursor: customersList.cursor,
      results: internalCustomers,
    }
    const customerResult = apiCustomersPaginatedSchema.safeParse(customersArr)
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
