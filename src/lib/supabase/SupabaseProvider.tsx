'use client'

import { SupabaseClient, type Session } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from './createBrowserClient'
import { Database } from './database.types'

type MaybeSession = Session | null

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: MaybeSession
}
const Context = createContext<SupabaseContext | undefined>(undefined)

/**
 * SupabaseProvider is how we expose the supabase client in client components
 **/
export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode

  session: MaybeSession
}) {
  const router = useRouter()
  const [supabase] = useState(() => createBrowserClient())
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // refresh server component data
      router.refresh()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])
  return (
    <Context.Provider value={{ supabase, session }}>
      <>{children}</>
    </Context.Provider>
  )
}
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}
