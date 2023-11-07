import { cookies } from 'next/headers'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

/**
 * Create an supabase DB client from a route handler
 * https://github.com/vercel/next.js/issues/45371
 **/
export const createAPIClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  })
}
