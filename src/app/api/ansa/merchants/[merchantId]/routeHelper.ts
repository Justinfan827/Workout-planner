import 'server-only'

import createClient from 'openapi-fetch'

import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import { InternalError } from '../../../errors'
import { authUserRequestInComponent } from '../../auth'
import { components, paths } from '../../swagger/client'
import { AnsaAPIResponse } from '../../types'
import { APIMerchant, apiMerchantSchema } from '../../validation/schema'
import { UpdateMerchantBody } from './routeSchema'

export async function getMerchantDetails(
  client: DBClient
): Promise<AnsaAPIResponse<APIMerchant>> {
  const { data, error } = await authUserRequestInComponent(client, {
    requireSuperadmin: false,
  })
  if (error) {
    return { error, data: null }
  }
  return getMerchantDetailsNoUserAuth(
    data.merchantInfo.merchantSecretKey,
    data.merchantInfo.merchantId
  )
}

// TODO: sync ansa merchants with supabase merchants if ansa merchants
// get deleted
export async function getMerchantDetailsNoUserAuth(
  ansaSecretKey: string,
  merchantId: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: merchant, response } = await ansaClient.GET(
      '/merchants/{merchantId}',
      {
        headers: {
          Authorization: ansaSecretKey,
        },
        params: {
          path: {
            merchantId,
          },
        },
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not fetch merchant'),
      }
    }
    if (!isDefined(merchant)) {
      return {
        data: null,
        error: new InternalError(
          'GET /merchants/{merchantId} response is undefined'
        ),
      }
    }
    return parseAnsaMerchant(merchant)
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

function parseAnsaMerchant(merchant: components['schemas']['merchant']) {
  const internalMerchant = {
    id: merchant.id,
    name: merchant.name,
    metadata: {
      autoReloadConfig: {
        minimumReloadAmount:
          merchant.metadata.auto_reload_config.minimum_auto_reload_amount,
        maximumReloadAmount:
          merchant.metadata.auto_reload_config.maximum_auto_reload_amount,
        minimumReloadThreshold:
          merchant.metadata.auto_reload_config.minimum_auto_reload_threshold,
      },

      ...(!!merchant.metadata.promotions && {
        promotionConfig: {
          type: merchant.metadata.promotions.type,
          rewardTiers: merchant.metadata.promotions.rewardTiers.map((tier) => ({
            minTransactionRequirement: tier.minTransactionRequirement,
            promotionAmount: tier.promotionAmount,
          })),
        },
      }),
    },
  }
  const merchantResult = apiMerchantSchema.safeParse(internalMerchant)
  if (!merchantResult.success) {
    return {
      data: null,
      error: new InternalError('Bad response from ansa', {
        cause: merchantResult.error,
      }),
    }
  }
  return {
    data: merchantResult.data,
    error: null,
  }
}

export async function updateMerchantNoUserAuth(
  ansaSecretKey: string,
  merchantId: string,
  body: UpdateMerchantBody
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: merchant, response } = await ansaClient.PUT(
      '/merchants/{merchantId}',
      {
        headers: {
          Authorization: ansaSecretKey,
        },
        params: {
          path: {
            merchantId,
          },
        },
        body: {
          promoConfig: body.promoConfig
            ? {
                promoType: body.promoConfig.promotionType,
                rewardTiers: body.promoConfig.tiers.map((tier) => ({
                  minTransactionRequirement: tier.minTransactionRequirement,
                  promoAmount: tier.promotionAmount,
                })),
              }
            : undefined,
        },
      }
    )
    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError('Could not fetch merchant'),
      }
    }
    if (!isDefined(merchant)) {
      return {
        data: null,
        error: new InternalError(
          'GET /merchants/{merchantId} response is undefined'
        ),
      }
    }
    return parseAnsaMerchant(merchant)
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
