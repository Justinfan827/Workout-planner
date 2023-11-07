import { ErrorBase, ErrorOptions } from '@/lib/errorBase'
import { PostgrestError } from '@supabase/supabase-js'

type DashboardAuthErrorClass = 'DashboardAuthError'
type DBErrorClass = 'DBError'

export class DashboardAuthError extends ErrorBase<DashboardAuthErrorClass> {
  constructor({
    message,
    options,
  }: {
    message: string
    options?: ErrorOptions
  }) {
    super({
      message,
      name: 'DashboardAuthError',
      ...options,
    })
  }
}

export class DBError extends ErrorBase<DBErrorClass> {
  constructor({ error }: { error: PostgrestError }) {
    super({
      message: error.message,
      name: 'DBError',
      annotations: {
        hint: error.hint,
        details: error.details,
      },
      labels: {
        pgErrorCode: error.code,
      },
    })
  }
}
