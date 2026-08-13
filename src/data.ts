import type {
  ApiGroup,
  ApiRequest,
  Assertion,
  Environment,
  HttpMethod,
  KeyValue,
  RequestBody,
} from './types'

function kv(key: string, value: string, enabled = true): KeyValue {
  return { id: `${key}_${Math.random().toString(36).slice(2, 7)}`, key, value, enabled }
}

function jsonBody(json: string): RequestBody {
  return { type: 'json', raw: json, fields: [] }
}

function emptyBody(): RequestBody {
  return { type: 'none', raw: '', fields: [] }
}

function assertion(
  name: string,
  type: Assertion['type'],
  target: string,
  operator: Assertion['operator'],
  expected: string,
): Assertion {
  return { id: `assert_${Math.random().toString(36).slice(2, 8)}`, name, type, target, operator, expected }
}

const commonHeaders = [kv('Content-Type', 'application/json')]

const loginBody = JSON.stringify(
  {
    account: 'admin@apiforge.dev',
    password: '********',
    device: 'web',
  },
  null,
  2,
)

const createUserBody = JSON.stringify(
  {
    name: '林晓',
    email: 'lin.xiao@example.com',
    role: 'member',
    department: '产品研发部',
  },
  null,
  2,
)

const createOrderBody = JSON.stringify(
  {
    productId: 'SKU-88921',
    quantity: 2,
    receiver: '林晓',
    address: '上海市徐汇区漕河泾开发区',
    note: '请在工作日送达',
  },
  null,
  2,
)

export const groups: ApiGroup[] = [
  {
    id: 'grp_auth',
    name: '认证服务',
    requests: [
      {
        id: 'req_login',
        name: '用户登录',
        method: 'POST',
        url: '{{baseUrl}}/auth/login',
        params: [],
        headers: [...commonHeaders],
        body: jsonBody(loginBody),
        tests: [
          assertion('响应状态码为 200', 'status', '', 'eq', '200'),
          assertion('响应时间小于 500ms', 'responseTime', '', 'lt', '500'),
          assertion('返回 token 字段', 'jsonPath', 'data.token', 'exists', ''),
          assertion('返回用户昵称', 'jsonPath', 'data.user.nickname', 'eq', '管理员'),
        ],
        description: '使用账号密码登录，成功后返回访问令牌。',
      },
      {
        id: 'req_register',
        name: '用户注册',
        method: 'POST',
        url: '{{baseUrl}}/auth/register',
        params: [],
        headers: [...commonHeaders],
        body: jsonBody(
          JSON.stringify(
            {
              account: 'new.member@example.com',
              password: 'Secure#2026',
              inviteCode: 'AF-OPEN',
            },
            null,
            2,
          ),
        ),
        tests: [
          assertion('响应状态码为 201', 'status', '', 'eq', '201'),
          assertion('返回新用户 ID', 'jsonPath', 'data.id', 'exists', ''),
        ],
      },
      {
        id: 'req_me',
        name: '获取当前用户',
        method: 'GET',
        url: '{{baseUrl}}/auth/me',
        params: [],
        headers: [kv('Authorization', 'Bearer {{token}}')],
        body: emptyBody(),
        tests: [assertion('响应状态码为 200', 'status', '', 'eq', '200')],
      },
    ],
  },
  {
    id: 'grp_users',
    name: '用户服务',
    requests: [
      {
        id: 'req_user_list',
        name: '用户列表',
        method: 'GET',
        url: '{{baseUrl}}/users',
        params: [kv('page', '1'), kv('pageSize', '20'), kv('keyword', '')],
        headers: [kv('Authorization', 'Bearer {{token}}')],
        body: emptyBody(),
        tests: [
          assertion('响应状态码为 200', 'status', '', 'eq', '200'),
          assertion('返回数据列表', 'jsonPath', 'data.list', 'exists', ''),
        ],
      },
      {
        id: 'req_user_detail',
        name: '用户详情',
        method: 'GET',
        url: '{{baseUrl}}/users/{{userId}}',
        params: [],
        headers: [kv('Authorization', 'Bearer {{token}}')],
        body: emptyBody(),
        tests: [assertion('响应状态码为 200', 'status', '', 'eq', '200')],
      },
      {
        id: 'req_user_create',
        name: '创建用户',
        method: 'POST',
        url: '{{baseUrl}}/users',
        params: [],
        headers: [...commonHeaders, kv('Authorization', 'Bearer {{token}}')],
        body: jsonBody(createUserBody),
        tests: [
          assertion('响应状态码为 201', 'status', '', 'eq', '201'),
          assertion('返回新用户 ID', 'jsonPath', 'data.id', 'exists', ''),
        ],
      },
      {
        id: 'req_user_update',
        name: '更新用户',
        method: 'PUT',
        url: '{{baseUrl}}/users/{{userId}}',
        params: [],
        headers: [...commonHeaders, kv('Authorization', 'Bearer {{token}}')],
        body: jsonBody(
          JSON.stringify(
            {
              role: 'admin',
              department: '技术平台部',
            },
            null,
            2,
          ),
        ),
        tests: [assertion('响应状态码为 200', 'status', '', 'eq', '200')],
      },
    ],
  },
  {
    id: 'grp_orders',
    name: '订单服务',
    requests: [
      {
        id: 'req_order_list',
        name: '订单列表',
        method: 'GET',
        url: '{{baseUrl}}/orders',
        params: [kv('status', 'all'), kv('page', '1')],
        headers: [kv('Authorization', 'Bearer {{token}}')],
        body: emptyBody(),
        tests: [
          assertion('响应状态码为 200', 'status', '', 'eq', '200'),
          assertion('返回订单总数', 'jsonPath', 'data.total', 'gt', '0'),
        ],
      },
      {
        id: 'req_order_create',
        name: '创建订单',
        method: 'POST',
        url: '{{baseUrl}}/orders',
        params: [],
        headers: [...commonHeaders, kv('Authorization', 'Bearer {{token}}')],
        body: jsonBody(createOrderBody),
        tests: [
          assertion('响应状态码为 201', 'status', '', 'eq', '201'),
          assertion('订单状态为待支付', 'jsonPath', 'data.status', 'eq', 'pending'),
        ],
      },
      {
        id: 'req_order_cancel',
        name: '取消订单',
        method: 'DELETE',
        url: '{{baseUrl}}/orders/{{orderId}}',
        params: [],
        headers: [kv('Authorization', 'Bearer {{token}}')],
        body: emptyBody(),
        tests: [assertion('响应状态码为 204', 'status', '', 'eq', '204')],
      },
    ],
  },
]

export const allRequests: ApiRequest[] = groups.flatMap((g) => g.requests)

export const environments: Environment[] = [
  {
    id: 'env_dev',
    name: '开发环境',
    variables: { baseUrl: 'http://localhost:3000', token: 'dev-token-9f82bc', userId: '101', orderId: 'O20260813001' },
  },
  {
    id: 'env_test',
    name: '测试环境',
    variables: { baseUrl: 'https://test-api.apiforge.dev', token: 'test-token-71ae40', userId: '102', orderId: 'O20260813002' },
  },
  {
    id: 'env_prod',
    name: '生产环境',
    variables: { baseUrl: 'https://api.apiforge.dev', token: 'prod-token-3c6d18', userId: '103', orderId: 'O20260813003' },
  },
]

export const methodColors: Record<HttpMethod, string> = {
  GET: 'var(--get)',
  POST: 'var(--post)',
  PUT: 'var(--put)',
  PATCH: 'var(--patch)',
  DELETE: 'var(--delete)',
  HEAD: 'var(--head)',
}

export const methodList: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
