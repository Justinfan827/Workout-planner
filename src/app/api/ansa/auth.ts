import 'server-only'

import {
  APIError,
  AuthError,
  InternalError,
  NotFoundError,
  getErrorResponse,
} from '@/api/errors'
import { Database } from '@/lib/supabase/database.types'
import { getUserMerchantWithKeys } from '@/lib/supabase/server/database.operations.queries'
import { DBClient } from '@/lib/supabase/types'
import { createClient } from '@supabase/supabase-js'

interface AuthOptions {
  requireSuperadmin: boolean
}

export interface AuthResponseData {
  merchantInfo: {
    merchantId: string
    merchantSecretKey: string
  }
}

export type AuthResponse =
  | {
      data: AuthResponseData
      error: null
    }
  | {
      data: null
      error: APIError
    }

/**
 *
 * authUserRequest verifies that the user is signed in.
 * If the user is signed in, we'll fetch the user's merchant id
 * and merchant secret key. This returns a NextResponse object and is
 * meant to be used in API routes.
 **/
export async function authUserRequest(
  userClient: DBClient,
  opts?: AuthOptions
) {
  const res = await authUserRequestInComponent(userClient, opts)
  if (res.error) {
    return { error: getErrorResponse(res.error), data: null }
  }
  return res
}

/**
 * authUserRequestInComponent verifies that the user is signed in.
 * If the user is signed in, we'll fetch the user's merchant id
 * and merchant secret key. This is for usage in server components.
 *
 **/
export async function authUserRequestInComponent(
  userClient: DBClient,
  opts?: AuthOptions
): Promise<AuthResponse> {
  const {
    data: { session },
  } = await userClient.auth.getSession()
  if (!session) {
    return { data: null, error: new AuthError('No client session found') }
  }

  /* Note:
     we instantiate an admin client with the supabase service role key
     because we lock down the merchant_keys table to only be accessible
     by the service role. This is to prevent users from accidentally fetching
     merchant keys from the client side.
  */
  const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  )
  const { data, error } = await getUserMerchantWithKeys(adminClient, session)

  if (error) {
    return {
      data: null,
      error: new InternalError(
        `Error fetching merchant info: ${error.message}`
      ),
    }
  }

  const merchant = data?.merchants
  // @ts-ignore (supabase doesn't get this type right.)
  const merchantSecretKey = merchant?.merchant_keys?.ansa_merchant_secret_key
  if (!merchantSecretKey || !merchant) {
    return {
      data: null,
      error: new NotFoundError('Could not get merchant keys'),
    }
  }
  return {
    error: null,
    data: {
      merchantInfo: {
        merchantSecretKey,
        merchantId: merchant.ansa_merchant_uuid,
      },
    },
  }
}
