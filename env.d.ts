namespace NodeJS {
  interface ProcessEnv {
    //
    // env vars available in the client
    //
    
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SENTRY_DSN: string
    NEXT_PUBLIC_SENTRY_ENV: string
    NEXT_PUBLIC_SENTRY_ENABLED: string
    NEXT_PUBLIC_SENTRY_DEBUG: string
    // This is only necessary in vercel production environments.
    NEXT_PUBLIC_SITE_URL: string
    
    
    //
    // env vars populated by vercel
    //

    
    NEXT_PUBLIC_VERCEL_BRANCH_URL: string
    VERCEL_ENV: string
    VERCEL_GIT_COMMIT_SHA: string

    //
    // env vars available in the server only
    //
    
    ANSA_ADMIN_API_KEY: string
    ANSA_HOST: string
    ANSA_ENV: string
    SENTRY_AUTH_TOKEN: string
    SUPABASE_SERVICE_ROLE_KEY: string
  }
}
