import type {
  ApiRequest,
  ApiResponse,
  Assertion,
  Environment,
  ResponseCookie,
  ResponseHeader,
  TestResult,
} from './types'

export function substitute(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
    return vars[key] ?? `{{${key}}}`
  })
}

const MIN_MOCK_LATENCY_MS = 160
const MOCK_LATENCY_SPREAD_MS = 260

function pretty(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}

interface MockSpec {
  status: number
  statusText: string
  body: unknown
  headers?: ResponseHeader[]
  cookies?: ResponseCookie[]
}

const user = {
  id: 101,
  nickname: '管理员',
  email: 'admin@apiforge.dev',
  role: 'admin',
  department: '技术平台部',
  createdAt: '2025-03-18T09:24:00Z',
}

function authHeaders(): ResponseHeader[] {
  return [
    { name: 'Content-Type', value: 'application/json; charset=utf-8' },
    { name: 'X-Request-Id', value: `req_${Math.random().toString(36).slice(2, 10)}` },
    { name: 'Cache-Control', value: 'no-store' },
  ]
}

const cookie: ResponseCookie = { name: 'af_session', value: 'sess_a1b2c3d4', domain: '.apiforge.dev', path: '/' }

function mockFor(request: ApiRequest, env: Environment): MockSpec {
  const token = env.variables.token ?? 'mock-token'
  const userId = env.variables.userId ?? '101'
  const orderId = env.variables.orderId ?? 'O20260813001'
  const fullUrl = substitute(request.url, env.variables)
  let path = fullUrl
  try {
    path = new URL(fullUrl).pathname
  } catch {
    path = fullUrl
  }
  const method = request.method

  const specs: Record<string, MockSpec> = {
    'POST /auth/login': {
      status: 200,
      statusText: 'OK',
      body: {
        code: 0,
        message: 'success',
        data: {
          token,
          expiresIn: 7200,
          user: { id: 101, nickname: '管理员', email: 'admin@apiforge.dev', role: 'admin' },
        },
      },
      cookies: [cookie],
    },
    'POST /auth/register': {
      status: 201,
      statusText: 'Created',
      body: { code: 0, message: 'success', data: { id: 2048, account: 'new.member@example.com' } },
    },
    'GET /auth/me': {
      status: 200,
      statusText: 'OK',
      body: { code: 0, message: 'success', data: user },
    },
    'GET /users': {
      status: 200,
      statusText: 'OK',
      body: {
        code: 0,
        message: 'success',
        data: {
          list: [
            { id: 101, name: '管理员', email: 'admin@apiforge.dev', role: 'admin', status: 'active' },
            { id: 102, name: '林晓', email: 'lin.xiao@example.com', role: 'member', status: 'active' },
            { id: 103, name: '陈默', email: 'chen.mo@example.com', role: 'member', status: 'disabled' },
          ],
          total: 3,
          page: 1,
          pageSize: 20,
        },
      },
    },
    [`GET /users/${userId}`]: {
      status: 200,
      statusText: 'OK',
      body: { code: 0, message: 'success', data: { ...user, id: Number(userId) } },
    },
    'POST /users': {
      status: 201,
      statusText: 'Created',
      body: { code: 0, message: 'success', data: { id: 104, name: '林晓', role: 'member' } },
    },
    [`PUT /users/${userId}`]: {
      status: 200,
      statusText: 'OK',
      body: { code: 0, message: 'success', data: { id: Number(userId), role: 'admin', department: '技术平台部' } },
    },
    'GET /orders': {
      status: 200,
      statusText: 'OK',
      body: {
        code: 0,
        message: 'success',
        data: {
          list: [
            { id: 'O20260813001', productId: 'SKU-88921', quantity: 2, status: 'pending', amount: 398.0 },
            { id: 'O20260812058', productId: 'SKU-12034', quantity: 1, status: 'paid', amount: 129.0 },
            { id: 'O20260811012', productId: 'SKU-44710', quantity: 3, status: 'shipped', amount: 597.0 },
          ],
          total: 3,
        },
      },
    },
    'POST /orders': {
      status: 201,
      statusText: 'Created',
      body: {
        code: 0,
        message: 'success',
        data: { id: orderId, status: 'pending', amount: 398.0, createdAt: '2026-08-13T08:30:00Z' },
      },
    },
    [`DELETE /orders/${orderId}`]: {
      status: 204,
      statusText: 'No Content',
      body: null,
    },
  }

  const key = `${method} ${path}`
  const exact = specs[key]
  if (exact) return exact

  if (method === 'GET' && path.startsWith('/users/')) {
    return { status: 200, statusText: 'OK', body: { code: 0, message: 'success', data: { ...user, id: Number(path.split('/')[2]) } } }
  }

  if (method === 'DELETE' && path.startsWith('/orders/')) {
    return { status: 204, statusText: 'No Content', body: null }
  }

  return {
    status: 404,
    statusText: 'Not Found',
    body: { code: 404, message: `未找到接口 ${method} ${path}`, data: null },
  }
}

function encodeSize(body: unknown): number {
  const text = body == null ? '' : JSON.stringify(body)
  return new TextEncoder().encode(text).length
}

export async function executeRequest(request: ApiRequest, env: Environment): Promise<ApiResponse> {
  const latency = MIN_MOCK_LATENCY_MS + Math.floor(Math.random() * MOCK_LATENCY_SPREAD_MS)
  await new Promise((resolve) => setTimeout(resolve, latency))

  const spec = mockFor(request, env)
  return {
    status: spec.status,
    statusText: spec.statusText,
    timeMs: latency,
    sizeBytes: encodeSize(spec.body),
    headers: spec.headers ?? authHeaders(),
    cookies: spec.cookies ?? [],
    body: spec.body,
  }
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return undefined
  const segments = path
    .replace(/^\$\.?/, '')
    .split('.')
    .filter(Boolean)
  let current: unknown = obj
  for (const seg of segments) {
    if (current == null) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[seg]
  }
  return current
}

function parseNumber(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function evaluateAssertion(assertion: Assertion, response: ApiResponse): TestResult {
  let actual: string
  let passed = false

  switch (assertion.type) {
    case 'status': {
      actual = String(response.status)
      passed = compare(actual, assertion.expected, assertion.operator)
      break
    }
    case 'responseTime': {
      actual = `${response.timeMs}ms`
      passed = compare(response.timeMs, parseNumber(assertion.expected) ?? 0, assertion.operator)
      break
    }
    case 'jsonPath': {
      const value = getByPath(response.body, assertion.target)
      const raw = value === undefined ? 'undefined' : typeof value === 'string' ? value : pretty(value)
      actual = raw
      if (assertion.operator === 'exists') {
        passed = value !== undefined && value !== null
      } else {
        passed = compare(value, assertion.expected, assertion.operator)
      }
      break
    }
    case 'header': {
      const header = response.headers.find((h) => h.name.toLowerCase() === assertion.target.toLowerCase())
      actual = header?.value ?? 'undefined'
      passed = assertion.operator === 'exists' ? Boolean(header) : compare(actual, assertion.expected, assertion.operator)
      break
    }
    case 'bodyContains': {
      actual = JSON.stringify(response.body)
      passed = actual.includes(assertion.expected)
      break
    }
  }

  return { assertion, passed, actual }
}

function compare(actual: unknown, expected: unknown, operator: Assertion['operator']): boolean {
  switch (operator) {
    case 'eq':
      return String(actual) === String(expected)
    case 'neq':
      return String(actual) !== String(expected)
    case 'gt':
      return (parseNumber(actual) ?? 0) > (parseNumber(expected) ?? 0)
    case 'lt':
      return (parseNumber(actual) ?? 0) < (parseNumber(expected) ?? 0)
    case 'contains':
      return String(actual).includes(String(expected))
    case 'exists':
      return actual !== undefined && actual !== null
    default:
      return false
  }
}

export function evaluateTests(request: ApiRequest, response: ApiResponse): TestResult[] {
  return request.tests.map((a) => evaluateAssertion(a, response))
}
