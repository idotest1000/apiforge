import { Plus, Trash2 } from 'lucide-react'
import type { Assertion, AssertionOperator, AssertionType } from '../types'
import { uid } from '../id'

interface Props {
  assertions: Assertion[]
  onChange: (items: Assertion[]) => void
}

const typeOptions: { value: AssertionType; label: string }[] = [
  { value: 'status', label: '状态码' },
  { value: 'responseTime', label: '响应时间' },
  { value: 'jsonPath', label: 'JSON 路径' },
  { value: 'header', label: '响应头' },
  { value: 'bodyContains', label: '响应体包含' },
]

const operatorOptions: { value: AssertionOperator; label: string }[] = [
  { value: 'eq', label: '等于' },
  { value: 'neq', label: '不等于' },
  { value: 'gt', label: '大于' },
  { value: 'lt', label: '小于' },
  { value: 'contains', label: '包含' },
  { value: 'exists', label: '存在' },
]

const targetPlaceholder: Record<AssertionType, string> = {
  status: '',
  responseTime: '',
  jsonPath: 'data.token',
  header: 'Content-Type',
  bodyContains: '',
}

export function AssertionEditor({ assertions, onChange }: Props) {
  const update = (id: string, patch: Partial<Assertion>) => {
    onChange(assertions.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  const remove = (id: string) => {
    onChange(assertions.filter((a) => a.id !== id))
  }

  const add = () => {
    onChange([
      ...assertions,
      {
        id: uid('assert'),
        name: '新断言',
        type: 'status',
        target: '',
        operator: 'eq',
        expected: '200',
      },
    ])
  }

  const needsTarget = (type: AssertionType) => type === 'jsonPath' || type === 'header'
  const needsExpected = (operator: AssertionOperator) => operator !== 'exists'

  return (
    <div>
      {assertions.length === 0 && (
        <div className="tests-empty">
          <div className="hint">还没有测试断言，添加断言以在发送请求后自动验证响应。</div>
        </div>
      )}

      {assertions.map((a) => (
        <div className="assertion-card" key={a.id}>
          <div className="assertion-head">
            <span className="grip">⋮⋮</span>
            <input
              className="assertion-name"
              value={a.name}
              onChange={(e) => update(a.id, { name: e.target.value })}
            />
            <button className="icon-btn" onClick={() => remove(a.id)} aria-label="删除断言">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="assertion-body">
            <select
              className="select"
              value={a.type}
              onChange={(e) => update(a.id, { type: e.target.value as AssertionType })}
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {needsTarget(a.type) ? (
              <input
                className="kv-input"
                value={a.target}
                placeholder={targetPlaceholder[a.type]}
                onChange={(e) => update(a.id, { target: e.target.value })}
                spellCheck={false}
              />
            ) : (
              <span />
            )}

            <select
              className="select"
              value={a.operator}
              onChange={(e) => update(a.id, { operator: e.target.value as AssertionOperator })}
            >
              {operatorOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {needsExpected(a.operator) ? (
              <input
                className="kv-input"
                value={a.expected}
                placeholder="期望值"
                onChange={(e) => update(a.id, { expected: e.target.value })}
                spellCheck={false}
              />
            ) : (
              <span />
            )}
          </div>
        </div>
      ))}

      <button className="kv-add" onClick={add}>
        <Plus size={14} />
        添加断言
      </button>
    </div>
  )
}
