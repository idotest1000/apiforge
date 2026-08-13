import { useState } from 'react'
import { CheckCircle2, Clock, Database, FileJson, Radio, XCircle } from 'lucide-react'
import type { ApiResponse, TestResult } from '../types'
import { JsonView } from './JsonView'

interface Props {
  response: ApiResponse | null
  tests: TestResult[]
  loading: boolean
}

type Tab = 'body' | 'headers' | 'tests' | 'cookies'

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-2xx'
  if (status >= 400 && status < 500) return 'status-4xx'
  if (status >= 500) return 'status-5xx'
  return ''
}

const KIB = 1024
const MIB = KIB * KIB

function formatSize(bytes: number): string {
  if (bytes < KIB) return `${bytes} B`
  if (bytes < MIB) return `${(bytes / KIB).toFixed(1)} KB`
  return `${(bytes / MIB).toFixed(1)} MB`
}

export function ResponsePanel({ response, tests, loading }: Props) {
  const [tab, setTab] = useState<Tab>('body')

  if (!response && !loading) {
    return (
      <div className="response">
        <div className="response-meta">
          <span className="meta-item">
            <span className="meta-label">响应</span>
          </span>
        </div>
        <div className="response-empty">
          <div className="response-empty-inner">
            <div className="icon-wrap">
              <Radio size={22} />
            </div>
            <h3>尚未发送请求</h3>
            <p>点击「发送」按钮执行当前接口，响应结果将显示在这里，包括状态码、耗时、响应体和测试断言结果。</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="response">
        <div className="response-meta">
          <span className="meta-item">
            <Clock size={14} color="var(--accent)" />
            <span>请求发送中...</span>
          </span>
        </div>
        <div className="response-body">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span className="spinner" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            正在等待服务端响应
          </div>
        </div>
      </div>
    )
  }

  const res = response!

  return (
    <div className="response">
      <div className="response-meta">
        <span className={`status-badge ${statusClass(res.status)}`}>
          {res.status} {res.statusText}
        </span>
        <span className="meta-item">
          <span className="meta-label">耗时</span>
          <span>{res.timeMs} ms</span>
        </span>
        <span className="meta-item">
          <span className="meta-label">大小</span>
          <span>{formatSize(res.sizeBytes)}</span>
        </span>
        {tests.length > 0 && (
          <span className="meta-item">
            <span className="meta-label">测试</span>
            <span style={{ color: tests.every((t) => t.passed) ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {tests.filter((t) => t.passed).length}/{tests.length} 通过
            </span>
          </span>
        )}
      </div>

      <div className="response-tabs">
        <button className={`subtab ${tab === 'body' ? 'active' : ''}`} onClick={() => setTab('body')}>
          <FileJson size={14} />
          响应体
        </button>
        <button className={`subtab ${tab === 'headers' ? 'active' : ''}`} onClick={() => setTab('headers')}>
          响应头
          <span className="count">{res.headers.length}</span>
        </button>
        <button className={`subtab ${tab === 'tests' ? 'active' : ''}`} onClick={() => setTab('tests')}>
          测试结果
          {tests.length > 0 && <span className="count">{tests.length}</span>}
        </button>
        <button className={`subtab ${tab === 'cookies' ? 'active' : ''}`} onClick={() => setTab('cookies')}>
          Cookies
          {res.cookies.length > 0 && <span className="count">{res.cookies.length}</span>}
        </button>
      </div>

      {tab === 'body' && (
        <div className="response-body">
          <JsonView value={res.body} />
        </div>
      )}

      {tab === 'headers' && (
        <div className="response-headers">
          <table className="kv-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {res.headers.map((h) => (
                <tr key={h.name}>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{h.name}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {h.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tests' && (
        <div className="response-body" style={{ padding: 0, background: 'var(--surface)' }}>
          {tests.length === 0 ? (
            <div className="tests-empty" style={{ margin: 16, border: '1px dashed var(--border-strong)' }}>
              <div className="hint">该接口没有配置测试断言。</div>
            </div>
          ) : (
            tests.map((t) => (
              <div className="test-result-row" key={t.assertion.id}>
                <span className="test-result-icon">
                  {t.passed ? (
                    <CheckCircle2 size={16} color="var(--success)" />
                  ) : (
                    <XCircle size={16} color="var(--danger)" />
                  )}
                </span>
                <div className="test-result-info">
                  <div className="test-result-name">{t.assertion.name}</div>
                  <div className="test-result-detail">
                    {t.assertion.type} · {t.assertion.operator} · 实际值: {t.actual}
                  </div>
                </div>
                <span className={`pill ${t.passed ? 'pass' : 'fail'}`}>{t.passed ? '通过' : '失败'}</span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'cookies' && (
        <div className="response-body" style={{ background: 'var(--surface)', padding: 0 }}>
          {res.cookies.length === 0 ? (
            <div className="tests-empty" style={{ margin: 16, border: '1px dashed var(--border-strong)' }}>
              <div className="hint">该响应没有返回 Cookie。</div>
            </div>
          ) : (
            res.cookies.map((c) => (
              <div className="test-result-row" key={c.name}>
                <span className="test-result-icon">
                  <Database size={16} color="var(--accent)" />
                </span>
                <div className="test-result-info">
                  <div className="test-result-name">{c.name}</div>
                  <div className="test-result-detail">
                    {c.value} · {c.domain}
                    {c.path}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
