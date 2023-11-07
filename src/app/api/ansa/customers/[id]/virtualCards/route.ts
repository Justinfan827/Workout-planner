import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createAPIClient } from '@/lib/supabase/createRouteHandlerClient'
import { BadRequestResponse } from '../../../../errors'
import { authUserRequest } from '../../../auth'
import { updateVirtualCardStatus } from './routeHelper'
import { bodySchema } from './routeSchema'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = createAPIClient()
  const { error, data: res } = await authUserRequest(client)
  if (error) {
    return error
  }
  const body = await request.json()
  const result = bodySchema.safeParse(body)
  if (!result.success) {
    return BadRequestResponse()
  }
  const configResponse = await updateVirtualCardStatus(
    res.merchantInfo.merchantSecretKey,
    params.id,
    result.data
  )
  return NextResponse.json(configResponse)
}
