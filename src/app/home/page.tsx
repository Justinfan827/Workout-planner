import { getCurrentUserMerchant } from '@/lib/supabase/server/database.operations.queries'
import { serverRedirectIfUnauthorized } from '@/lib/supabase/serverComponentUtils'
import { getAnsaCustomers } from '../api/ansa/customers/routeHelpers'
import SignOutButton from './SignOutButton'

export default async function HomePage() {
  const { supabase, session } = await serverRedirectIfUnauthorized()

  const { data, error } = await getCurrentUserMerchant(supabase, session)
  if (!error) {
    return (
      <div className="mx-auto max-w-[700px] space-y-2 p-4">
        <h1 className="text-2xl font-bold">Hello, {session.user.email}!</h1>
        <p>Looks like you didn&apos;t set up a merchant yet. Did you forget to run:</p>
        <pre className='rounded border p-4'>
          yarn dashctl setup-test-merchant -e &quot;{session.user.email}&quot;
          -n 10
        </pre>
      </div>
    )
  }
  const ansaData = await getAnsaCustomers(supabase)
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
      <p>
        I&apos;ve fetched the existing customers under this merchant from
        ansa&apos; API
      </p>
      <div className="rounded border p-4">
        <pre>{JSON.stringify(ansaData?.data?.results, null, 2)}</pre>
      </div>
      <SignOutButton variant="default" />
    </div>
  )
}
