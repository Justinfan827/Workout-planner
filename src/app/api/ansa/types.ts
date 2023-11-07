import { APIError } from '../errors'

export interface AnsaAPISuccessResponse<T> {
  data: T
  error: null
}

export interface AnsaAPIErrorResponse {
  data: null
  error: APIError
}

export type AnsaAPIResponse<T> =
  | AnsaAPIErrorResponse
  | AnsaAPISuccessResponse<T>
