export type ErrorLabels =
  | 'merchantId'
  | 'customerId'
  | 'transactionId'
  | 'userId'
  | 'ansaStatusCode'
  | 'pgErrorCode'

type Labels = Partial<Record<ErrorLabels, string | number>>
type Annotations = Record<string, Object>

export type ErrorOptions = {
  // an original error that caused this error
  cause?: Error
  // extra data to be added to the error e.g. sent as unindexed data to sentry
  annotations?: Annotations // structured indexed data to be added to the error e.g. sent as indexed data to sentry
  labels?: Labels
}

export class ErrorBase<T extends string> extends Error {
  name: T
  message: string
  cause?: Error
  // added as unindexed annotations sentry
  annotations: Annotations
  // added as indexed searchable tags in sentry
  labels: Labels
  constructor({
    name,
    message,
    cause,
    annotations,
    labels,
  }: {
    name: T
    message: string
    cause?: Error
    annotations?: Annotations
    labels?: Labels
  }) {
    super(message)
    this.name = name
    this.message = message
    this.cause = cause
    this.annotations = annotations || {}
    this.labels = labels || {}
  }
}
