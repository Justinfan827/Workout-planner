import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createAPIClient } from '@/lib/supabase/createRouteHandlerClient'
import { BadRequestResponse } from '../../../../errors'
import { authUserRequest } from '../../../auth'
import { configureCustomerAutoReloadConfigInternal } from './routeHelper'
import { autoReloadBodySchema } from './routeSchema'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = createAPIClient()
  const { data, error } = await authUserRequest(client)
  if (error) {
    return error
  }
  const body = await request.json()
  const result = autoReloadBodySchema.safeParse(body)
  if (!result.success) {
    return BadRequestResponse()
  }
  const configResponse = await configureCustomerAutoReloadConfigInternal(
    params.id,
    result.data,
    data.merchantInfo.merchantSecretKey
  )
  return NextResponse.json(configResponse)
}
