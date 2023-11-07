import { Session } from '@supabase/supabase-js'
import { DBClient } from './types'
import { isAdmin } from './utils'

export async function updateSuperadminUserMerchant(
  client: DBClient,
  session: Session,
  merchantUUID: string
) {
  if (!isAdmin(session)) {
    return { data: null, error: new Error('user is not a superadmin') }
  }
  return await client
    .from('superadmin_merchants')
    .update({
      merchant_uuid: merchantUUID,
    })
    .eq('user_uuid', session.user.id)
    .select()
}

export async function removeUserFromMerchant(
  client: DBClient,
  session: Session,
  userUUID: string
) {
  if (!isAdmin(session)) {
    return { data: null, error: new Error('user is not a superadmin') }
  }
  return client
    .from('user_merchants')
    .delete()
    .eq('user_uuid', userUUID)
    .single()
}

export async function addUserToMerchant(
  client: DBClient,
  session: Session,
  email: string
) {
  if (!isAdmin(session)) {
    return { data: null, error: new Error('user is not a superadmin') }
  }

  const { data, error } = await client
    .from('superadmin_merchants')
    .select('*, users(email)')
    .eq('user_uuid', session.user?.id)
    .single()
  if (error) {
    return { error }
  }
  if (!data) {
    return { error: new Error('no superadmin merchant found') }
  }

  if (data.users?.email === email) {
    return { error: new Error(`You can't add yourself`) }
  }
  const { data: userData, error: userError } = await client
    .from('users')
    .select('*, user_merchants(merchant_uuid)')
    .eq('email', email)
    .single()
  if (userError) {
    return { error: new Error(`No user found with email: ${email}`) }
  }
  const merchantUUID = data.merchant_uuid
  const userUUID = userData.uuid
  if (!!userData.user_merchants) {
    // @ts-ignore -- supabase gets this type wrong
    const userMerchantUUID = userData.user_merchants.merchant_uuid
    if (userMerchantUUID === merchantUUID) {
      return {
        error: new Error(`User is already associated with this merchant`),
      }
    }
    return {
      error: new Error(
        `User is already associated with another merchant: ${userMerchantUUID}`
      ),
    }
  }

  const { error: adduserErr } = await client
    .from('user_merchants')
    .insert({ user_uuid: userUUID, merchant_uuid: merchantUUID })
  return { error: adduserErr }
}
