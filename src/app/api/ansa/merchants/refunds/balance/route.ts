import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createAPIClient } from '@/lib/supabase/createRouteHandlerClient'
import {
  BadRequestResponse,
  InternalServerErrorResponse,
} from '../../../../errors'
import { authUserRequest } from '../../../auth'
import { refundBalance } from './routeHelper'
import { refundSchema } from './routeSchema'

export async function POST(request: NextRequest) {
  const client = createAPIClient()
  const res = await authUserRequest(client)
  if (res.error) {
    return res.error
  }
  const body = await request.json()
  const result = refundSchema.safeParse(body)
  if (!result.success) {
    return BadRequestResponse()
  }
  const { data, error } = await refundBalance(client, result.data)

  if (error) {
    return InternalServerErrorResponse()
  }
  return NextResponse.json({ data })
}