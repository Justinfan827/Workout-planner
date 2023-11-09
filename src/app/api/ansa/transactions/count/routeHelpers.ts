import 'server-only'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { authUserRequestInComponent } from '../../auth'
import { paths } from '../../swagger/client'
import { AnsaAPIResponse } from '../../types'
import { APICount, apiCountSchema } from '../../validation/schema'
import { queryParams } from './routeSchema'

export async function getTransactionsCount(
  client: DBClient,
  query: queryParams = {}
): Promise<AnsaAPIResponse<APICount>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getTransactionsCountNoUserAuth(
    query,
    data.merchantInfo.merchantSecretKey
  )
}

async function getTransactionsCountNoUserAuth(
  query: queryParams,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET('/transactions/count', {
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
        error: new InternalError(`Could not fetch customer transactions count`),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /transactions/count response is undefined`
        ),
      }
    }
    const safeData = apiCountSchema.safeParse(data)
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
