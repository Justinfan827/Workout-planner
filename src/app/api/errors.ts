import { ErrorBase, ErrorOptions } from '@/lib/errorBase'
import { exhaustiveGuard } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const BadRequestResponse = () =>
  new NextResponse('Bad Request', { status: 400 })
export const UnauthorizedResponse = () =>
  new NextResponse('Unauthorized', { status: 403 })
export const InternalServerErrorResponse = (msg?: BodyInit) =>
  new NextResponse(msg || 'Internal Server Error', {
    status: 500,
  })
export const NotFoundErrorResponse = () =>
  new NextResponse('Not Found', {
    status: 404,
  })

type APIErrorClass =
  | 'AUTH_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'BAD_REQUEST_ERROR'

/*
 * APIError is the base class for all errors related to external API calls.
 * Every error returned from an external API should be wrapped in an instance of APIError.
 * The options object contains:
 *   1. cause: the original error that caused this error
 *   2. annotations: extra data to be added to the error e.g. sent as unindexed data to sentry
 *   3. labels: structured indexed data to be added to the error e.g. sent as indexed data to sentry
 */
export class APIError extends ErrorBase<APIErrorClass> {
  constructor({
    message,
    name,
    options,
  }: {
    message: string
    name: APIErrorClass
    options?: ErrorOptions
  }) {
    super({ message, name: name || 'AUTH_ERROR', ...options })
  }
}

export class AuthError extends APIError {
  constructor(message: string, options?: ErrorOptions) {
    super({ message, name: 'AUTH_ERROR', options })
  }
}

export class InternalError extends APIError {
  constructor(message: string, options?: ErrorOptions) {
    super({ message, name: 'INTERNAL_ERROR', options })
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, options?: ErrorOptions) {
    super({ message, name: 'NOT_FOUND_ERROR', options })
  }
}

export class BadRequestError extends APIError {
  constructor(message: string, options?: ErrorOptions) {
    super({ message, name: 'BAD_REQUEST_ERROR', options })
  }
}

/*
 * convert instances of APIError into the appropriate NextResponse object
 **/
export function getErrorResponse(error: Error) {
  if (error instanceof APIError) {
    switch (error.name) {
      case 'AUTH_ERROR':
        return UnauthorizedResponse()
      case 'INTERNAL_ERROR':
        return InternalServerErrorResponse()
      case 'NOT_FOUND_ERROR':
        return NotFoundErrorResponse()
      case 'BAD_REQUEST_ERROR':
        return BadRequestResponse()
      default:
        return exhaustiveGuard(error.name)
    }
  }
  return InternalServerErrorResponse()
}

/*
 * Utility function to check if an Error is an instance of APIError and matches the given APIErrorClass
 **/
export function matchesAPIErrorClass(error: Error, name: APIErrorClass) {
  if (error instanceof APIError) {
    return error.name === name
  }
  return false
}
