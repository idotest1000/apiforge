import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Send } from 'lucide-react'
import type { ApiRequest, BodyType, HttpMethod } from '../types'
import { methodList } from '../data'
import { KeyValueEditor } from './KeyValueEditor'
import { AssertionEditor } from './AssertionEditor'

interface Props {
  request: ApiRequest
  onChange: (patch: Partial<ApiRequest>) => void
  onSend: () => void
  sending: boolean
}

type Subtab = 'params' | 'headers' | 'body' | 'tests'

const bodyTypes: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'none' },
  { value: 'json', label: 'JSON' },
  { value: 'form-data', label: 'form-data' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'raw', label: 'raw' },
]

export function RequestEditor({ request, onChange, onSend, sending }: Props) {
  const [subtab, setSubtab] = useState<Subtab>('params')
  const [methodOpen, setMethodOpen] = useState(false)
  const methodRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (methodRef.current && !methodRef.current.contains(e.target as Node)) setMethodOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const activeParams = request.params.filter((p) => p.enabled).length
  const activeHeaders = request.headers.filter((h) => h.enabled).length
  const testCount = request.tests.length

  const setMethod = (method: HttpMethod) => {
    onChange({ method })
    setMethodOpen(false)
  }

  return (
    <div className="editor">
      <div className="request-bar">
        <div className="method-select" ref={methodRef}>
          <button
            className="method-select-trigger"
            style={{ color: `var(--${request.method.toLowerCase()})` }}
            onClick={() => setMethodOpen((v) => !v)}
          >
            {request.method}
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>
          {methodOpen && (
            <div className="method-menu">
              {methodList.map((m) => (
                <button
                  key={m}
                  className="method-menu-item"
                  style={{ color: `var(--${m.toLowerCase()})` }}
                  onClick={() => setMethod(m)}
                >
                  <span className={`method method-${m}`}>{m}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          className="url-input"
          value={request.url}
          onChange={(e) => onChange({ url: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !sending) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder="输入接口地址，支持 {{变量}}"
          spellCheck={false}
        />

        <button className="send-btn" onClick={onSend} disabled={sending}>
          {sending ? (
            <>
              <span className="spinner" />
              发送中
            </>
          ) : (
            <>
              <Send size={14} />
              发送
            </>
          )}
        </button>
      </div>

      <div className="request-subtabs">
        <button className={`subtab ${subtab === 'params' ? 'active' : ''}`} onClick={() => setSubtab('params')}>
          参数
          {activeParams > 0 && <span className="count">{activeParams}</span>}
        </button>
        <button className={`subtab ${subtab === 'headers' ? 'active' : ''}`} onClick={() => setSubtab('headers')}>
          请求头
          {activeHeaders > 0 && <span className="count">{activeHeaders}</span>}
        </button>
        <button className={`subtab ${subtab === 'body' ? 'active' : ''}`} onClick={() => setSubtab('body')}>
          请求体
          {request.body.type !== 'none' && <span className="count">{request.body.type}</span>}
        </button>
        <button className={`subtab ${subtab === 'tests' ? 'active' : ''}`} onClick={() => setSubtab('tests')}>
          测试
          {testCount > 0 && <span className="count">{testCount}</span>}
        </button>
      </div>

      <div className="request-body">
        {subtab === 'params' && (
          <KeyValueEditor
            items={request.params}
            onChange={(params) => onChange({ params })}
            keyPlaceholder="参数名"
            valuePlaceholder="参数值"
          />
        )}
        {subtab === 'headers' && (
          <KeyValueEditor
            items={request.headers}
            onChange={(headers) => onChange({ headers })}
            keyPlaceholder="Header 名称"
            valuePlaceholder="Header 值"
          />
        )}
        {subtab === 'body' && (
          <div>
            <div className="body-type-row">
              {bodyTypes.map((bt) => (
                <button
                  key={bt.value}
                  className={`body-type ${request.body.type === bt.value ? 'active' : ''}`}
                  onClick={() => onChange({ body: { ...request.body, type: bt.value } })}
                >
                  {bt.label}
                </button>
              ))}
            </div>
            {request.body.type === 'json' || request.body.type === 'raw' ? (
              <textarea
                className="code-editor"
                value={request.body.raw}
                onChange={(e) => onChange({ body: { ...request.body, raw: e.target.value } })}
                placeholder={
                  request.body.type === 'json'
                    ? '{\n  "key": "value"\n}'
                    : '输入原始请求体...'
                }
                spellCheck={false}
              />
            ) : request.body.type === 'form-data' || request.body.type === 'x-www-form-urlencoded' ? (
              <KeyValueEditor
                items={request.body.fields}
                onChange={(fields) => onChange({ body: { ...request.body, fields } })}
                keyPlaceholder="字段名"
                valuePlaceholder="字段值"
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>该请求不包含请求体。</div>
            )}
          </div>
        )}
        {subtab === 'tests' && (
          <AssertionEditor assertions={request.tests} onChange={(tests) => onChange({ tests })} />
        )}
      </div>
    </div>
  )
}
