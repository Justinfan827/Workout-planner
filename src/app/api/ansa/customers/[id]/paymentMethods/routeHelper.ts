import 'server-only'

import createClient from 'openapi-fetch'

import { InternalError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { authUserRequestInComponent } from '../../../auth'
import { paths } from '../../../swagger/client'
import { AnsaAPIResponse } from '../../../types'
import {
  APIPaymentMethod,
  apiPaymentMethodArraySchema,
} from '../../../validation/schema'

export async function getCustomerPaymentMethods(
  client: DBClient,
  customerId: string
): Promise<AnsaAPIResponse<APIPaymentMethod[]>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getCustomerPaymentMethodsInternal(
    customerId,
    data.merchantInfo.merchantSecretKey
  )
}

async function getCustomerPaymentMethodsInternal(
  customerId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data, response } = await ansaClient.GET(
      '/customers/{customerId}/payment-methods',
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
          `Could not fetch customer payment methods with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(data)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/payment-methods response is undefined`
        ),
      }
    }
    const internalPaymentMethod = data.paymentMethods.map((paymentMethod) => {
      return {
        id: paymentMethod.id,
        customerId: customerId,
        brand: paymentMethod.card?.brand,
        lastFour: paymentMethod.card?.lastFour,
      }
    })
    const safeData = apiPaymentMethodArraySchema.safeParse(
      internalPaymentMethod
    )
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
