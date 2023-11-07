import 'server-only'

import { Session } from '@supabase/supabase-js'
import { DBClient, DbResult, DbResultOk } from '../types'

export type UserMerchantResponse = DbResult<typeof getUserMerchantWithKeys>
export type UserMerchantResponseSuccess = DbResultOk<
  typeof getUserMerchantWithKeys
>['data']

export async function getUserFirstLast(client: DBClient, session: Session) {
  return client
    .from('users')
    .select('first_name, last_name')
    .eq('uuid', session.user.id)
    .single()
}

/**
 * getUserMerchantWithKeys fetches the merchant id + merchant secret key given an authenticated user
 * session. This should only be allowed on the server. This also handles the superadmin
 * use case. (i.e. selecting a merchant from the dropdown)
 **/
export async function getUserMerchantWithKeys(
  client: DBClient,
  session: Session
) {
  const { data, error } = await client
    .from('user_merchants')
    .select(
      `
        user_uuid, 
        merchants (
          uuid, 
          ansa_merchant_uuid,
          merchant_keys (ansa_merchant_secret_key)
        )
        `
    )
    .eq('user_uuid', session.user.id)
    .single()

  return { data, error }
}

/**
 * getCurrentUserMerchant fetches the merchant id without the merchant secret key given an authenticated user
 * session. This should only be allowed on the server. This also handles the superadmin
 * use case. (i.e. selecting a merchant from the dropdown)
 **/
export async function getCurrentUserMerchant(
  client: DBClient,
  session: Session
) {
  const { data, error } = await client
    .from('user_merchants')
    .select(
      'user_uuid, merchants (uuid, ansa_merchant_uuid, ansa_merchant_name)'
    )
    .eq('user_uuid', session.user.id)
    .single()

  return { data, error }
}
