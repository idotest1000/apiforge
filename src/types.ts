export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface KeyValue {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw'

export interface RequestBody {
  type: BodyType
  raw: string
  fields: KeyValue[]
}

export type AssertionType = 'status' | 'responseTime' | 'jsonPath' | 'header' | 'bodyContains'
export type AssertionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists'

export interface Assertion {
  id: string
  name: string
  type: AssertionType
  target: string
  operator: AssertionOperator
  expected: string
}

export interface ApiRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  params: KeyValue[]
  headers: KeyValue[]
  body: RequestBody
  tests: Assertion[]
  description?: string
}

export interface ApiGroup {
  id: string
  name: string
  requests: ApiRequest[]
}

export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
}

export interface ResponseHeader {
  name: string
  value: string
}

export interface ResponseCookie {
  name: string
  value: string
  domain: string
  path: string
}

export interface ApiResponse {
  status: number
  statusText: string
  timeMs: number
  sizeBytes: number
  headers: ResponseHeader[]
  cookies: ResponseCookie[]
  body: unknown
}

export interface TestResult {
  assertion: Assertion
  passed: boolean
  actual: string
}

export interface RequestRunResult {
  request: ApiRequest
  response: ApiResponse
  tests: TestResult[]
  passed: boolean
}

export interface CollectionRun {
  id: string
  startedAt: number
  results: RequestRunResult[]
}
