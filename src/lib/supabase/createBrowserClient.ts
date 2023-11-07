import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

/**
 * Create a supabase DB client from the browser
 **/
export function createBrowserClient() {
  return createClientComponentClient<Database>()
}
