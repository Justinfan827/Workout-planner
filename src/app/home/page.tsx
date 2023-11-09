import { getCurrentUserMerchant } from '@/lib/supabase/server/database.operations.queries'
import { serverRedirectIfUnauthorized } from '@/lib/supabase/serverComponentUtils'
import SignOutButton from './SignOutButton'

export default async function HomePage() {
  const { supabase, session } = await serverRedirectIfUnauthorized()

  const { data, error } = await getCurrentUserMerchant(supabase, session)
  if (error) {
    return <div className="p-4">Error: {error.message}</div>
  }
  return (
    <div className="mx-auto max-w-[700px] space-y-2 p-4">
      <div className="">
        Welcome: <span className="font-bold">{session.user.email}!</span> You
        are logged in.
      </div>
      <p>I&apos;ve fetched your merchant info from the db:</p>
      <div className="rounded border p-4">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      <SignOutButton variant="default" />
    </div>
  )
}
