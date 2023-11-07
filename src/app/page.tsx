import { serverRedirectToHomeIfAuthorized } from '@/lib/supabase/serverComponentUtils'
import { redirect } from 'next/navigation'

// TODO: once we have a home page, then we can render something, but for now, we
// navigate to /home/customers if the user is authorized, otherwise we navigate
// to /signin
export default async function Page() {
  await serverRedirectToHomeIfAuthorized()
  redirect('/signin')
}
