namespace NodeJS {
  interface ProcessEnv {
    // env vars available in the client
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SENTRY_DSN: string
    NEXT_PUBLIC_SENTRY_ENV: string
    NEXT_PUBLIC_SENTRY_ENABLED: string
    NEXT_PUBLIC_SENTRY_DEBUG: string

    // env vars available in the server only
    SUPABASE_SERVICE_ROLE_KEY: string
    ANSA_ADMIN_API_KEY: string
    ANSA_HOST: string
    SENTRY_AUTH_TOKEN: string
  }
}
