import { Database } from '@/lib/supabase/database.types'
import { createClient } from '@supabase/supabase-js'
import { infoLog } from '../utils'

export default async function runCmd({
  email,
  supabaseURL,
  supabaseServiceRoleKey,
}: {
  email: string
  supabaseURL: string
  supabaseServiceRoleKey: string
}) {
  const supabase = createClient<Database>(supabaseURL, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const adminAuthClient = supabase.auth.admin

  // get user
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (userErr) {
    throw userErr
  }

  if (!user) {
    infoLog(`User not found. Creating user...`)
    const { data: userData, error: createUserErr } =
      await adminAuthClient.createUser({
        email,
        email_confirm: true,
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
      })
    if (createUserErr) {
      throw createUserErr
    }
    return userData.user.id
  }
  infoLog('User found... not creating user.')
  return user.uuid
}
