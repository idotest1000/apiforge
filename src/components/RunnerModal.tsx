import { CheckCircle2, PlayCircle, X, XCircle } from 'lucide-react'
import type { CollectionRun } from '../types'
import { MethodBadge } from './MethodBadge'

interface Props {
  run: CollectionRun | null
  onClose: () => void
}

export function RunnerModal({ run, onClose }: Props) {
  if (!run) return null

  const total = run.results.length
  const passedRequests = run.results.filter((r) => r.tests.every((t) => t.passed)).length
  const failedRequests = total - passedRequests
  const totalTests = run.results.reduce((acc, r) => acc + r.tests.length, 0)
  const passedTests = run.results.reduce((acc, r) => acc + r.tests.filter((t) => t.passed).length, 0)
  const duration = run.results.reduce((acc, r) => acc + r.response.timeMs, 0)

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <PlayCircle size={20} color="var(--accent)" />
          <div style={{ flex: 1 }}>
            <div className="modal-title">测试集运行报告</div>
            <div className="modal-subtitle">ApiForge 接口自动化测试 · 共 {total} 个请求</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="runner-summary">
            <div className="summary-card total">
              <div className="value">{total}</div>
              <div className="label">请求总数</div>
            </div>
            <div className="summary-card pass">
              <div className="value">{passedRequests}</div>
              <div className="label">请求通过</div>
            </div>
            <div className="summary-card fail">
              <div className="value">{failedRequests}</div>
              <div className="label">请求失败</div>
            </div>
            <div className="summary-card duration">
              <div className="value">{duration}ms</div>
              <div className="label">总耗时</div>
            </div>
          </div>

          <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>执行明细</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              断言 {passedTests}/{totalTests} 通过
            </span>
          </div>

          <div className="runner-list">
            {run.results.map((r) => {
              const passed = r.tests.every((t) => t.passed)
              return (
                <div className="runner-row" key={r.request.id}>
                  {passed ? (
                    <CheckCircle2 size={17} color="var(--success)" />
                  ) : (
                    <XCircle size={17} color="var(--danger)" />
                  )}
                  <MethodBadge method={r.request.method} />
                  <div className="req">
                    <div className="req-name">{r.request.name}</div>
                    <div className="req-url">{r.request.url}</div>
                  </div>
                  <div className="metrics">
                    <span>{r.response.status}</span>
                    <span>{r.response.timeMs}ms</span>
                    <span className={`pill ${passed ? 'pass' : 'fail'}`}>
                      {r.tests.filter((t) => t.passed).length}/{r.tests.length}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
