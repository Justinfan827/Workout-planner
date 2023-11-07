import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { DashboardAuthError } from '@/errors/errors'
import { AuthErrorCodeInvalidCodeExchange } from '@/lib/supabase/constants'
import type { Database } from '@/lib/supabase/database.types'
import { getError } from '@/lib/utils'
import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'

/**
 * This endpoint handles the code exchange in the supabase auth flow:
 * https://supabase.com/docs/guides/auth/auth-helpers/nextjs#code-exchange-route
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  // Handle errors sent via query params
  // from the auth server. E.g. expired magic link.
  const error = requestUrl.searchParams.get('error')
  if (error) {
    const redirectErrorURL =
      `${requestUrl.origin}/signin?` + requestUrl.searchParams
    const errorDescription = requestUrl.searchParams.get('error_description')
    const errorCode = requestUrl.searchParams.get('error_code')
    Sentry.captureException(new DashboardAuthError({ message: error }), {
      tags: {
        auth_error_type: errorDescription,
        auth_error_code: errorCode,
      },
    })
    return NextResponse.redirect(redirectErrorURL)
  }
  const code = requestUrl.searchParams.get('code')
  const original = requestUrl.searchParams.get('original_path')

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    try {
      /* 
       Handle both errors returned and thrown from exchangeCodeForSession.
       e.g. If the user opens the magic link email in a different browser
       than the one they initiated the sign in with.
       
       Here, we exchange an auth code for the user's session, 
       which is set as a cookie for future requests made to Supabase. 
      */
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        throw error
      }
    } catch (e) {
      const error = getError(e)
      const errorTitle = AuthErrorCodeInvalidCodeExchange
      const errorDescription =
        error.message || 'Could not exchange code for session'
      const errorCode = '500'
      requestUrl.searchParams.set('error', errorTitle)
      requestUrl.searchParams.set('error_code', errorCode)
      requestUrl.searchParams.set('error_description', errorDescription)
      Sentry.captureException(new DashboardAuthError({ message: errorTitle }), {
        tags: {
          auth_error_type: errorDescription,
          auth_error_code: errorCode,
        },
      })

      const redirectErrorURL =
        `${requestUrl.origin}/signin?` + requestUrl.searchParams

      return NextResponse.redirect(redirectErrorURL)
    }
  }

  if (original) {
    return NextResponse.redirect(`${requestUrl.origin}${original}`)
  }
  // URL to redirect to after sign in process completes
  // TODO: redirect to home page when we have that built out
  return NextResponse.redirect(`${requestUrl.origin}/home/customers?limit=20`)
}
