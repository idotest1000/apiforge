import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Play, Zap } from 'lucide-react'
import type { Environment } from '../types'

interface Props {
  environments: Environment[]
  activeEnvId: string
  onSelectEnv: (id: string) => void
  onRunCollection: () => void
  running: boolean
}

export function Header({ environments, activeEnvId, onSelectEnv, onRunCollection, running }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = environments.find((e) => e.id === activeEnvId)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">
          <Zap size={16} strokeWidth={2.4} />
        </span>
        <span className="brand-name">ApiForge</span>
        <span className="brand-tag">接口自动化平台</span>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        <div className="env-menu" ref={ref}>
          <button className="btn" onClick={() => setOpen((v) => !v)}>
            <span style={{ color: 'var(--text-muted)' }}>环境</span>
            <span style={{ fontWeight: 600 }}>{active?.name ?? '未选择'}</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>
          {open && (
            <div className="env-panel">
              {environments.map((env) => (
                <button
                  key={env.id}
                  className={`env-option ${env.id === activeEnvId ? 'active' : ''}`}
                  onClick={() => {
                    onSelectEnv(env.id)
                    setOpen(false)
                  }}
                >
                  <div>
                    <div>{env.name}</div>
                    <div className="base">{env.variables.baseUrl}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={onRunCollection} disabled={running}>
          {running ? (
            <>
              <span className="spinner" />
              运行中
            </>
          ) : (
            <>
              <Play size={14} />
              运行测试集
            </>
          )}
        </button>
      </div>
    </header>
  )
}
