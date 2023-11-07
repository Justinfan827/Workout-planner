import { GeistMono, GeistSans } from 'geist/font'
import './globals.css'

import { QueryProvider } from '@/components/QueryProvider'
import { TailwindIndicator } from '@/components/TailwindIndicator'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import SupabaseProvider from '@/lib/supabase/SupabaseProvider'
import { createServerClient } from '@/lib/supabase/createServerClient'
import { isDev } from '@/lib/utils'

export const metadata = {
  title: 'Ansa frontend template',
  description: 'Ansa frontend template',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // pass the session down so that all client components can access the supabase session.
  // Server components can just call createServerClient.
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable} h-full min-w-[1000px]`}
      lang="en"
    >
      <body className={`h-full`}>
        {/* TODO: Once theming is complete, change this to enable dark mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme={isDev() ? 'system' : 'light'}
          enableSystem={isDev() ? true : false}
        >
          <SupabaseProvider session={session}>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
            <TailwindIndicator />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
