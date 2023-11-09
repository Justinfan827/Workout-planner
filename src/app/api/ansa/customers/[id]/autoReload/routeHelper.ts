import 'server-only'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { authUserRequestInComponent } from '../../../auth'
import { components, paths } from '../../../swagger/client'
import { AnsaAPIResponse } from '../../../types'
import { APIAutoReload, apiAutoReloadSchema } from '../../../validation/schema'
import { AutoReloadBody } from './routeSchema'

export async function getCustomerAutoReloadSettings(
  client: DBClient,
  customerId: string
): Promise<AnsaAPIResponse<APIAutoReload>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getCustomerAutoReloadSettingsNoUserAuth(
    customerId,
    data.merchantInfo.merchantSecretKey
  )
}

async function getCustomerAutoReloadSettingsNoUserAuth(
  customerId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET(
      '/customers/{customerId}/auto-reload',
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
          `Could not fetch customer auto reload data with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/auto-reload response is null`
        ),
      }
    }
    return parseAutoReloadResponse(data)
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

const parseAutoReloadResponse = (
  data: components['schemas']['customer__auto_reload_config_response']
) => {
  const internalAutoReloadSettings = {
    enabled: data.enabled,
    ...(data.paymentMethodId && { paymentMethodId: data.paymentMethodId }),
    ...(data.reloadAmount && { reloadAmount: data.reloadAmount }),
    ...(data.reloadThreshold && { reloadThreshold: data.reloadThreshold }),
  }
  const safeData = apiAutoReloadSchema.safeParse(internalAutoReloadSettings)
  if (!safeData.success) {
    return {
      data: null,
      error: new InternalError('Bad response from ansa', {
        cause: safeData.error,
      }),
    }
  }
  return { data: safeData.data, error: null }
}

export async function configureCustomerAutoReloadConfig(
  client: DBClient,
  customerId: string,
  payload: AutoReloadBody
): Promise<AnsaAPIResponse<APIAutoReload>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return configureCustomerAutoReloadConfigNoUserAuth(
    customerId,
    payload,
    data.merchantInfo.merchantSecretKey
  )
}

export async function configureCustomerAutoReloadConfigNoUserAuth(
  customerId: string,
  payload: AutoReloadBody,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: autoReloadResponse, response } = await ansaClient.POST(
      '/customers/{customerId}/auto-reload',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        body: payload,
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
        error: new InternalError('Could not update auto reload config'),
      }
    }
    if (!isDefined(autoReloadResponse)) {
      return {
        data: null,
        error: new InternalError(
          'POST /customers/{customerId}/auto-reload response is undefined'
        ),
      }
    }
    return parseAutoReloadResponse(autoReloadResponse)
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
