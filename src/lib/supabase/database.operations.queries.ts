// These are operations that are used to query the database
// from the client side.

import { Session } from '@supabase/supabase-js'
import { DBClient } from './types'

/*
 * fetch all users for a given merchant
 */
export async function getMerchantUsers(supabase: DBClient, session: Session) {
  const fetchUserMerchants = async (merchantUUID: string) => {
    const { data: merchantUsers, error: merchantUsersError } = await supabase
      .from('users')
      .select('*, user_merchants!inner(*)') //https://supabase.com/blog/postgrest-9#resource-embedding-with-inner-joins
      .eq('user_merchants.merchant_uuid', merchantUUID)

    if (merchantUsersError) {
      return { data: null, error: merchantUsersError }
    }

    return { data: merchantUsers, error: null }
  }
  const { data, error } = await supabase
    .from('user_merchants')
    .select('*')
    .eq('user_uuid', session.user?.id)
    .single()

  if (error) {
    return {}
  }
  if (!data) {
    return { data: null, error: new Error('no rows found') }
  }
  return fetchUserMerchants(data.merchant_uuid)
}

export async function getAllUsers(supabase: DBClient) {
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('*')
    .limit(1000)

  if (usersErr) {
    return { data: null, error: usersErr }
  }

  return { data: users, error: null }
}
