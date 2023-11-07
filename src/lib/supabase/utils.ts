// https://github.com/supabase-community/supabase-custom-claims
// only users with the ADMIN value under the ADMIN_CUSTOM_CLAIM_KEY can

import { Session, User } from '@supabase/supabase-js'

// view this page.
const ADMIN_CUSTOM_CLAIM_KEY = 'ANSA_USER_ROLE'
const ADMIN_CUSTOM_CLAIM_VALUE = 'SUPERADMIN'

export function isAdmin(session: Session) {
  return (
    session.user?.app_metadata?.[ADMIN_CUSTOM_CLAIM_KEY] ===
    ADMIN_CUSTOM_CLAIM_VALUE
  )
}

export function isAdminUser(user: User) {
  return (
    user.app_metadata?.[ADMIN_CUSTOM_CLAIM_KEY] === ADMIN_CUSTOM_CLAIM_VALUE
  )
}
