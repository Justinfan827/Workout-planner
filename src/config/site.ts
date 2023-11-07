import { getSiteURL } from '@/lib/utils'

export const siteConfig = {
  name: 'Ansa Dashboard',
  auth: {
    callbackURL: ({ query }: { query?: URLSearchParams }) =>
      `${getSiteURL()}api/auth/callback${query ? `?${query}` : ''}`,
  },
}
