import 'server-only'

import { BadRequestError, InternalError, NotFoundError } from '@/app/api/errors'
import { DBClient } from '@/lib/supabase/types'
import { isDefined } from '@/lib/utils'
import createClient from 'openapi-fetch'
import { authUserRequestInComponent } from '../../../auth'
import { paths } from '../../../swagger/client'
import { AnsaAPIResponse } from '../../../types'
import { APIVirtualCard, apiVirtualCard } from '../../../validation/schema'
import { BodyParams } from './routeSchema'

export async function getCustomerVirtualCard(
  client: DBClient,
  customerId: string
): Promise<AnsaAPIResponse<APIVirtualCard>> {
  const { data, error } = await authUserRequestInComponent(client)
  if (error) {
    return { error, data: null }
  }
  return getCustomerVirtualCardNoUserAuth(
    customerId,
    data.merchantInfo.merchantSecretKey
  )
}

async function getCustomerVirtualCardNoUserAuth(
  customerId: string,
  merchantSecretKey: string
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: virtualCard, response } = await ansaClient.GET(
      '/customers/{customerId}/virtual-card',
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

    if (response.status === 404) {
      return {
        data: null,
        error: new NotFoundError(
          `Customer with id: ${customerId} does not have a virtual card`
        ),
      }
    }

    // handle merchants that don't have an active virtual card
    if (response.status === 400) {
      const body = await response.json()
      if (body.code === 'virtual_card_program_inactive') {
        return {
          data: null,
          error: new NotFoundError(
            `Customer with id: ${customerId} does not have a virtual card`
          ),
        }
      }
      return {
        data: null,
        error: new BadRequestError(
          `Bad request fetching customer with id: ${customerId}'s virtual card`
        ),
      }
    }

    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not fetch customer virtual card with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(virtualCard)) {
      return {
        data: null,
        error: new InternalError(
          `GET /customer/${customerId}/virtual-card response is undefined`
        ),
      }
    }
    const internalVirtualCard = {
      id: virtualCard.id,
      customerId: customerId,
      type: virtualCard.type,
      createdAt: virtualCard.createdAt,
      card: {
        lastFour: virtualCard.card?.lastFour,
        expMonth: virtualCard.card?.expMonth,
        expYear: virtualCard.card?.expYear,
        cardHolderName: virtualCard.card?.cardHolderName,
        cardNetwork: virtualCard.card?.cardNetwork,
        state: virtualCard.card?.state,
      },
    }

    const virtualCardResult = apiVirtualCard.safeParse(internalVirtualCard)
    if (!virtualCardResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: virtualCardResult.error,
        }),
      }
    }
    return { data: virtualCardResult.data, error: null }
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

export async function updateVirtualCardStatus(
  merchantSecretKey: string,
  customerId: string,
  body: BodyParams
) {
  const ansaClient = createClient<paths>({ baseUrl: process.env.ANSA_HOST })
  try {
    const { data: virtualCard, response } = await ansaClient.PUT(
      '/customers/{customerId}/virtual-card',
      {
        headers: {
          Authorization: merchantSecretKey,
        },
        params: {
          path: {
            customerId,
          },
        },
        body,
      }
    )

    if (response.status === 404) {
      return {
        data: null,
        error: new NotFoundError(
          `Customer with id: ${customerId} does not have a virtual card`
        ),
      }
    }

    // handle merchants that don't have an active virtual card
    if (response.status === 400) {
      const body = await response.json()
      if (body.code === 'virtual_card_program_inactive') {
        return {
          data: null,
          error: new NotFoundError(
            `Customer with id: ${customerId} does not have a virtual card`
          ),
        }
      }
      return {
        data: null,
        error: new BadRequestError(
          `Bad request updating customer with id: ${customerId}'s virtual card`
        ),
      }
    }

    if (response.status !== 200) {
      return {
        data: null,
        error: new InternalError(
          `Could not update customer virtual card with id: ${customerId}`
        ),
      }
    }
    if (!isDefined(virtualCard)) {
      return {
        data: null,
        error: new InternalError(
          `PUT /customer/${customerId}/virtual-card response is undefined`
        ),
      }
    }
    const internalVirtualCard = {
      id: virtualCard.id,
      customerId: customerId,
      type: virtualCard.type,
      createdAt: virtualCard.createdAt,
      card: {
        lastFour: virtualCard.card?.lastFour,
        expMonth: virtualCard.card?.expMonth,
        expYear: virtualCard.card?.expYear,
        cardHolderName: virtualCard.card?.cardHolderName,
        cardNetwork: virtualCard.card?.cardNetwork,
        state: virtualCard.card?.state,
      },
    }

    const virtualCardResult = apiVirtualCard.safeParse(internalVirtualCard)
    if (!virtualCardResult.success) {
      return {
        data: null,
        error: new InternalError('Bad response from ansa', {
          cause: virtualCardResult.error,
        }),
      }
    }
    return { data: virtualCardResult.data, error: null }
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
