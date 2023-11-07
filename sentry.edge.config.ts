// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { ErrorBase } from '@/lib/errorBase'
import { isDev } from '@/lib/utils'
import * as Sentry from '@sentry/nextjs'
import { ErrorEvent, EventHint } from '@sentry/types'

const {
  NEXT_PUBLIC_SENTRY_ENABLED,
  NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENV,
  NEXT_PUBLIC_SENTRY_DEBUG,
} = process.env

if (NEXT_PUBLIC_SENTRY_ENABLED === 'true' || !isDev()) {
  Sentry.init({
    dsn: NEXT_PUBLIC_SENTRY_DSN,
    environment: NEXT_PUBLIC_SENTRY_ENV,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.05,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: NEXT_PUBLIC_SENTRY_DEBUG === 'true' || false,
    beforeSend: (event: ErrorEvent, hint: EventHint) => {
      const error = hint.originalException
      if (error instanceof ErrorBase) {
        event.tags = {
          ...event.tags,
          ...error.labels,
        }
        event.extra = {
          ...event.extra,
          ...error.annotations,
        }
        event.fingerprint = [error.name]
        return event
      }
      return event
    },
  })
}
