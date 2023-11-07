import 'server-only'

import { authUserRequestInComponent } from '@/app/api/ansa/auth'
import { paths } from '@/app/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/app/api/ansa/types'
import { APICount, apiCountSchema } from '@/app/api/ansa/validation/schema'
import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'

export async function getCustomerVirtualCardTransactionsCount(
  client: DBClient,
  customerId: string
): Promise<AnsaAPIResponse<APICount>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return fetch(customerId, data.merchantInfo.merchantSecretKey)
}

async function fetch(customerId: string, merchantSecretKey: string) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: res, response } = await ansaClient.GET(
      '/customers/{customerId}/virtual-card/transactions/count',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          path: {
            customerId,
          },
        },
      }
    )

    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch customer virtual card transactions count with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(res)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/virtual-card/transactions/count response is undefined`
        ),
      }
    }
    const totalCountResult = apiCountSchema.safeParse(res)

    if (!totalCountResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: totalCountResult.error,
        }),
      }
    }
    return { data: totalCountResult.data, error: null }
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
