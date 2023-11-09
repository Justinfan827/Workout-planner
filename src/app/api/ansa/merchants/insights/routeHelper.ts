import 'server-only'

import createClient from 'openapi-fetch'

import { authUserRequestInComponent } from '@/api/ansa/auth'
import { paths } from '@/api/ansa/swagger/client'
import { AnsaAPIResponse } from '@/api/ansa/types'
import {
  APIMerchantInsights,
  apiMerchantInsights,
} from '@/api/ansa/validation/schema'
import { InternalError } from '@/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined, isProdLike } from '@/lib/utils'

const revalidateTime = () => (!isProdLike() ? 10 : 3600 * 4)

export async function getMerchantInsights(
  client: DBClient,
  opts: { nextRequestConfig: NextFetchRequestConfig } = {
    nextRequestConfig: {
      // revalidate this data every 4 hours in production, 10 seconds in dev.
      revalidate: revalidateTime(),
    },
  }
): Promise<AnsaAPIResponse<APIMerchantInsights>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }

  return getMerchantInsightsNoUserAuth(
    data.merchantInfo.merchantSecretKey,
    data.merchantInfo.merchantId,
    opts
  )
}

export async function getMerchantInsightsNoUserAuth(
  merchantSecretKey: string,
  merchantId: string,
  nextOpts: { nextRequestConfig: NextFetchRequestConfig }
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  // Note: we need to wrap this in a try catch.
  // openapi-fetch throws errors if there is a network issue when making the request.
  // On non 200 responses, it returns the response object with a non 200 status code.
  try {
    const { data: merchantInsights, response } = await ansaClient.GET(
      '/merchants/{merchantId}/insights',
      {
        next: {
          ...nextOpts.nextRequestConfig,
        },
        headers: {
          Authorization: merchantSecretKey,
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
        error: new InternalError('Could not fetch merchant insights data'),
      }
    }
    if (!isDefined(merchantInsights)) {
      return {
        data: null,
        error: new InternalError(
          'GET /internal-admin/merchants/{merchantId}/insights response is undefined'
        ),
      }
    }
    const internalInsights: Partial<APIMerchantInsights> = {
      totalUsers: merchantInsights.totalUsers,
      totalCustomerAddedBalance:
        merchantInsights.totalCustomerAddedBalance.amount,
      totalCustomerBalance: merchantInsights.totalCustomerBalance.amount,
      totalSettledBalance: merchantInsights.totalSettledBalance.amount,
      totalMerchantFundedBalance:
        merchantInsights.totalMerchantFundedBalance.amount,
    }
    const merchantResult = apiMerchantInsights.safeParse(internalInsights)
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
