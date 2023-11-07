// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.05,
    environment: NEXT_PUBLIC_SENTRY_ENV,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: NEXT_PUBLIC_SENTRY_DEBUG === 'true' || false,
    ignoreErrors: [
      // https://github.com/getsentry/sentry-javascript/issues/9290
      /^Dynamic server usage: Page couldn't be rendered statically because it used/,
    ],
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
    // we could consider this to add extra error data to the logged error
    // https://docs.sentry.io/platforms/javascript/configuration/integrations/extraerrordata/?original_referrer=https%3A%2F%2Fdocs.sentry.io%2Fplatforms%2Fjavascript%2Fintegrations%2Fplugin%2F
    // integrations: [new ExtraErrorData({ depth: 10 })],
  })
}
