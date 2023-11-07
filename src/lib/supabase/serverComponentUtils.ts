import 'server-only'

import { redirect } from 'next/navigation'
import { createServerClient } from './createServerClient'
import { isAdmin } from './utils'

/**
 * This file contains utils to only use in SERVER COMPONENTS.
 **/

interface ServerAuthOptions {
  requireAdmin?: boolean
  originalPath?: string
}

export const checkSuperadminStatus = async () => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return { supabase, session, isAdmin: session && isAdmin(session) }
}

/**
 * serverRedirectToLoginIfUnauthoried can be used in server components
 * to redirect to the login flow if the user is unauthorized.
 **/
export const serverRedirectToLoginIfUnauthoried = async (
  opts: ServerAuthOptions = {
    requireAdmin: false,
    originalPath: '',
  }
) => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to signin page.
  // Also pass the original URL so we can redirect back to it after signin.
  if (!session) {
    redirect(
      '/signin?' + new URLSearchParams({ original_path: opts.originalPath! })
    )
  }

  if (opts.requireAdmin && !isAdmin(session)) {
    redirect('/signin')
  }
  return { supabase, session }
}

/**
 * serverRedirectToHomeIfAuthorized can be used in server components
 * to redirect to the users home page if the user is authorized
 **/
export const serverRedirectToHomeIfAuthorized = async () => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    redirect('/home/customers')
  }
  return { supabase, session }
}
