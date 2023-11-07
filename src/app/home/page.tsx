import { serverRedirectIfUnauthorized } from '@/lib/supabase/serverComponentUtils'

export default async function HomePage() {
  const { session } = await serverRedirectIfUnauthorized()
  return (
    <div className="p-4">
      <div className="mx-auto max-w-[500px]">
        Welcome: {session.user.email}! You are logged in.
      </div>
    </div>
  )
}
