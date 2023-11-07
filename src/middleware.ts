import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  //https://github.com/vercel/next.js/issues/43704
  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(req.headers)
  const searchParams = new URLSearchParams(req.nextUrl.search)
  const originalPath = req.nextUrl.pathname + '?' + searchParams
  requestHeaders.set('x-path', originalPath)
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  const supabase = createMiddlewareClient<Database>({ req, res })
  // Since Next.js only allows read acccess to cookies in server components,
  // we call get session here to refresh any expired sessions and set a new cookie
  // header before loading the route we're trying to navigate to.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#refresh-session-with-middleware
  await supabase.auth.getSession()
  return res
}
