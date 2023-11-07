import { clsx, type ClassValue } from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { twMerge } from 'tailwind-merge'

dayjs.extend(utc)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null
}

// useful for switch statements on union types
export function exhaustiveGuard(_value: never): never {
  throw new Error(
    `ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      _value
    )}`
  )
}

type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError
  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

// https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
// helper for extracting error messages from unknown errors.
// useful for handling errors in catch blocks.
export function getError(error: unknown) {
  return toErrorWithMessage(error)
}

// sleep function
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isDev() {
  return (
    process.env.VERCEL_ENV === 'development' ||
    process.env.NODE_ENV === 'development'
  )
}

/**
 * This only returns true if the environment is currently
 * a production environment. I.e. we're in Ansa's
 * prod-sandbox or prod-live environment
 **/
export function isProdLike() {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production' ||
    process.env.ANSA_ENV === 'prod-sandbox'
  )
}

export function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatCurrency(amount: number) {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  })
  return numberFormat.format(amount)
}

export function formatNumber(num: number) {
  return num.toLocaleString('en-US')
}

export function parseISO8601Date(dateString: string) {
  return dayjs.utc(dateString)
}

export function formatISO8601Date(date: dayjs.Dayjs, format: string) {
  return date.utc().format(format)
}

/**
 * getSiteURL attempts to determine the site url based on the environment.
 * NEXT_PUBLIC_SITE_URL needs to be set in the vercel production environment.
 * NEXT_PUBLIC_VERCEL_BRANCH_URL is automatically set by vercel in preview environments.
 *
 * We mainly need to be smart about this for the auth redirect urls.
 * Make sure to properly set the auth callback url in the supabase project:
 * https://supabase.com/docs/guides/auth#redirect-urls-and-wildcards
 */
export function getSiteURL() {
  // https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? // Automatically set by Vercel.
    // TODO: handle preview urls.
    // Unfortunately I don't know of a good way to determine whether
    // we're in a Vercel preview deployment or not.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  return url
}

// Given a telephone number like:
// tel:+1-530-539-5125, strip it of all non-numeric characters
// and format it like: (530)-539-5125 without the country code
export function formatDisplayPhoneNumber(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.length !== 11) {
    // invalid phone number. Do nothing.
    return tel
  }
  const areaCode = digits.slice(1, 4)
  const prefix = digits.slice(4, 7)
  const lineNumber = digits.slice(7)
  return `(${areaCode}) ${prefix}-${lineNumber}`
}

// Given a phone number like: (122) 133-1312
// format into a tel: link like: tel:+1-122-133-1312
export function formatPhoneInputNumber(address: string): string {
  const digits = address.replace(/\D/g, '')
  if (digits.length !== 10) {
    // invalid phone number. Do nothing.
    return address
  }
  const areaCode = digits.slice(0, 3)
  const prefix = digits.slice(3, 6)
  const lineNumber = digits.slice(6)
  return `tel:+1-${areaCode}-${prefix}-${lineNumber}`
}
