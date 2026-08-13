import { useState } from 'react'
import { ChevronRight, FilePlus2, FolderOpen, Search } from 'lucide-react'
import type { ApiGroup } from '../types'
import { MethodBadge } from './MethodBadge'

interface Props {
  groups: ApiGroup[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewRequest: () => void
}

export function Sidebar({ groups, activeId, onSelect, onNewRequest }: Props) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = groups
    .map((g) => ({
      ...g,
      requests: g.requests.filter((r) =>
        `${r.name} ${r.method} ${r.url}`.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.requests.length > 0)

  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">
          <span className="sidebar-title-label">接口集合</span>
          <button className="icon-btn" onClick={onNewRequest} aria-label="新建请求" title="新建请求">
            <FilePlus2 size={16} />
          </button>
        </div>
        <div className="search-box">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索接口..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="sidebar-tree">
        {filtered.map((group) => {
          const isCollapsed = collapsed[group.id]
          return (
            <div className="tree-group" key={group.id}>
              <button className="tree-group-head" onClick={() => toggle(group.id)} style={{ width: '100%' }}>
                <span className={`chevron ${isCollapsed ? '' : 'open'}`}>
                  <ChevronRight size={14} />
                </span>
                <FolderOpen size={14} color="var(--text-secondary)" />
                <span style={{ flex: 1, textAlign: 'left' }}>{group.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.requests.length}</span>
              </button>
              {!isCollapsed &&
                group.requests.map((req) => (
                  <button
                    className={`tree-request ${activeId === req.id ? 'active' : ''}`}
                    key={req.id}
                    onClick={() => onSelect(req.id)}
                  >
                    <MethodBadge method={req.method} />
                    <span className="name">{req.name}</span>
                  </button>
                ))}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
            没有匹配的接口
          </div>
        )}
      </div>

      <div className="sidebar-foot">
        <button className="btn btn-sm" onClick={onNewRequest}>
          <FilePlus2 size={14} />
          新建请求
        </button>
      </div>
    </aside>
  )
}
