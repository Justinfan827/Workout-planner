import 'server-only'

import { redirect } from 'next/navigation'
import { createServerClient } from './createServerClient'

/**
 * This file contains utils to only use in SERVER COMPONENTS.
 **/

interface ServerAuthOptions {
  redirectTo: string
  queryParams?: URLSearchParams
}

/**
 * serverRedirectIfUnauthoried can be used in server components
 * to redirect to a login / sign up flow if the user is unauthorized.
 * You can also optionally pass additional query params to the redirect
 * path to save some state. Example use case:
 *
 * attach an 'original_path' query param to remember where the user was trying
 * to go before they were redirected to the login flow.;
 **/
export const serverRedirectIfUnauthorized = async (
  opts: ServerAuthOptions = {
    queryParams: new URLSearchParams(),
    redirectTo: '/signin',
  }
) => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(opts.redirectTo + '?' + opts.queryParams)
  }
  return { supabase, session }
}

/**
 * serverRedirectToHomeIfAuthorized can be used in server components
 * to redirect to the users home page if the user is authorized
 **/
export const serverRedirectIfAuthorized = async (route: string) => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    redirect(route)
  }
}
