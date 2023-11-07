import { cookies } from 'next/headers'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cache } from 'react'
import { Database } from './database.types'

/**
 * Create a supabase DB client from a server component
 * https://github.com/vercel/next.js/issues/45371
 *
 * Note that this uses the cookies() function opts the
 * page into dynamic rendering, which causes fetch('...')
 * calls to default to cache: no-store i.e. fetch calls
 * don't cache by default.
 **/
export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
})
