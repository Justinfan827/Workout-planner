import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createAPIClient } from '@/lib/supabase/createRouteHandlerClient'
import { isDefined } from '@/lib/utils'
import { BadRequestResponse, InternalServerErrorResponse } from '../../errors'
import { authUserRequest } from '../auth'
import { getAnsaCustomersInternal } from './routeHelpers'
import { queryParamsSchema } from './routeSchema'

/**
 * Fetch the customer list for a given merchant.
 * Requires a user to be signed in.
 * Can be used from client components via fetch API
 **/
export async function GET(request: NextRequest) {
  const client = createAPIClient()
  const res = await authUserRequest(client)
  if (res.error) {
    return res.error
  }
  const limit = request.nextUrl.searchParams.get('limit')
  const starting_after = request.nextUrl.searchParams.get('starting_after')
  const queryParams = {
    ...(isDefined(limit) && { limit: parseInt(limit) }),
    ...(isDefined(starting_after) && { starting_after }),
  }
  const result = queryParamsSchema.safeParse(queryParams)
  if (!result.success) {
    return BadRequestResponse()
  }
  const { data, error } = await getAnsaCustomersInternal(
    result.data,
    res.data.merchantInfo.merchantSecretKey
  )
  if (error) {
    return InternalServerErrorResponse()
  }
  return NextResponse.json({ data })
}
