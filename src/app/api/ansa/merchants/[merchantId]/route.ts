import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createAPIClient } from '@/lib/supabase/createRouteHandlerClient'
import {
  BadRequestResponse,
  InternalServerErrorResponse,
} from '../../../errors'
import { authUserRequest } from '../../auth'
import { updateMerchantInternal } from './routeHelper'
import { updateMerchantBodySchema } from './routeSchema'

export async function PUT(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  const client = createAPIClient()
  const { error: authErr, data: res } = await authUserRequest(client)
  if (authErr) {
    return authErr
  }
  const body = await request.json()
  const result = updateMerchantBodySchema.safeParse(body)
  if (!result.success) {
    return BadRequestResponse()
  }
  const { data, error } = await updateMerchantInternal(
    res.merchantInfo.merchantSecretKey,
    params.merchantId,
    result.data
  )
  if (error) {
    return InternalServerErrorResponse()
  }
  return NextResponse.json({ data })
}
