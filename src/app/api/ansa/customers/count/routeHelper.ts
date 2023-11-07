import 'server-only'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { authUserRequestInComponent } from '../../auth'
import { paths } from '../../swagger/client'
import { AnsaAPIResponse } from '../../types'
import { APICount, apiCountSchema } from '../../validation/schema'

export async function getAnsaCustomerCount(
  client: DBClient
): Promise<AnsaAPIResponse<APICount>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getAnsaCustomerCountInternal(data.merchantInfo.merchantSecretKey)
}

async function getAnsaCustomerCountInternal(merchantSecretKey: string) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: count, response } = await ansaClient.GET('/customers/count', {
      headers: {
        Authorization: merchantSecretKey,
      },
    })
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not get customer count'),
      }
    }
    if (!isDefined(count)) {
      return {
        data: null,
        error: new InternalError('GET /customers/count response is undefined'),
      }
    }
    const countResult = apiCountSchema.safeParse(count)
    if (!countResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: countResult.error,
        }),
      }
    }
    return {
      data: countResult.data,
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
