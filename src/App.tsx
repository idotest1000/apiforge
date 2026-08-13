import { useCallback, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { FilePlus2, X } from 'lucide-react'
import type {
  ApiGroup,
  ApiRequest,
  ApiResponse,
  CollectionRun,
  Environment,
  TestResult,
} from './types'
import { environments, groups as seedGroups } from './data'
import { uid } from './id'
import { evaluateTests, executeRequest } from './engine'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RequestEditor } from './components/RequestEditor'
import { ResponsePanel } from './components/ResponsePanel'
import { RunnerModal } from './components/RunnerModal'

const DEFAULT_EDITOR_HEIGHT = 300
const MIN_EDITOR_HEIGHT = 150
const MAX_EDITOR_HEIGHT_RATIO = 0.72
const FALLBACK_CONTAINER_HEIGHT = 600

function newRequest(): ApiRequest {
  return {
    id: uid('req'),
    name: '新接口',
    method: 'GET',
    url: '{{baseUrl}}/',
    params: [],
    headers: [],
    body: { type: 'none', raw: '', fields: [] },
    tests: [],
  }
}

export default function App() {
  const [groups, setGroups] = useState<ApiGroup[]>(seedGroups)
  const [activeId, setActiveId] = useState<string | null>(seedGroups[0].requests[0].id)
  const [openTabs, setOpenTabs] = useState<string[]>([seedGroups[0].requests[0].id])
  const [envId, setEnvId] = useState(environments[1].id)
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({})
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({})
  const [sending, setSending] = useState(false)
  const [runningCollection, setRunningCollection] = useState(false)
  const [run, setRun] = useState<CollectionRun | null>(null)
  const [editorHeight, setEditorHeight] = useState(DEFAULT_EDITOR_HEIGHT)
  const splitRef = useRef<HTMLDivElement>(null)

  const activeEnv: Environment = environments.find((e) => e.id === envId) ?? environments[0]

  const requestMap = useMemo(() => {
    const map = new Map<string, ApiRequest>()
    groups.forEach((g) => g.requests.forEach((r) => map.set(r.id, r)))
    return map
  }, [groups])

  const activeRequest = activeId ? requestMap.get(activeId) : undefined

  const selectRequest = useCallback(
    (id: string) => {
      setActiveId(id)
      setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]))
    },
    [],
  )

  const closeTab = useCallback(
    (id: string) => {
      const idx = openTabs.indexOf(id)
      const next = openTabs.filter((t) => t !== id)
      setOpenTabs(next)
      if (id === activeId) {
        const fallback = next[Math.min(idx, next.length - 1)]
        setActiveId(fallback ?? null)
      }
    },
    [activeId, openTabs],
  )

  const updateRequest = useCallback((id: string, patch: Partial<ApiRequest>) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        requests: g.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),
    )
  }, [])

  const createRequest = useCallback(() => {
    const req = newRequest()
    setGroups((prev) =>
      prev.map((g, i) => (i === 0 ? { ...g, requests: [req, ...g.requests] } : g)),
    )
    selectRequest(req.id)
  }, [selectRequest])

  const send = useCallback(async () => {
    if (!activeRequest || sending) return
    setSending(true)
    setTestResults((prev) => ({ ...prev, [activeRequest.id]: [] }))
    const response = await executeRequest(activeRequest, activeEnv)
    const results = evaluateTests(activeRequest, response)
    setResponses((prev) => ({ ...prev, [activeRequest.id]: response }))
    setTestResults((prev) => ({ ...prev, [activeRequest.id]: results }))
    setSending(false)
  }, [activeRequest, activeEnv, sending])

  const runCollection = useCallback(async () => {
    if (runningCollection) return
    setRunningCollection(true)
    const results: CollectionRun['results'] = []
    const requests = groups.flatMap((g) => g.requests)
    for (const req of requests) {
      const response = await executeRequest(req, activeEnv)
      const tests = evaluateTests(req, response)
      results.push({ request: req, response, tests, passed: tests.every((t) => t.passed) })
    }
    setRun({ id: uid('run'), startedAt: Date.now(), results })
    setRunningCollection(false)
  }, [activeEnv, groups, runningCollection])

  const startDrag = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const startHeight = editorHeight
      const onMove = (ev: MouseEvent) => {
        const containerHeight = splitRef.current?.parentElement?.clientHeight ?? FALLBACK_CONTAINER_HEIGHT
        const next = startHeight + (ev.clientY - startY)
        setEditorHeight(Math.max(MIN_EDITOR_HEIGHT, Math.min(next, containerHeight * MAX_EDITOR_HEIGHT_RATIO)))
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [editorHeight],
  )

  return (
    <div className="app">
      <Header
        environments={environments}
        activeEnvId={envId}
        onSelectEnv={setEnvId}
        onRunCollection={runCollection}
        running={runningCollection}
      />

      <div className="app-body">
        <Sidebar
          groups={groups}
          activeId={activeId}
          onSelect={selectRequest}
          onNewRequest={createRequest}
        />

        <main className="main">
          <div className="tabs">
            {openTabs.map((id) => {
              const req = requestMap.get(id)
              if (!req) return null
              return (
                <div
                  className={`tab ${id === activeId ? 'active' : ''}`}
                  key={id}
                  onClick={() => setActiveId(id)}
                >
                  <span className={`method method-${req.method}`} style={{ fontSize: 10 }}>
                    {req.method}
                  </span>
                  <span className="tab-name">{req.name}</span>
                  <span
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(id)
                    }}
                  >
                    <X size={12} />
                  </span>
                </div>
              )
            })}
          </div>

          {activeRequest ? (
            <div className="workspace">
              <div style={{ height: editorHeight, flex: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <RequestEditor
                  key={activeRequest.id}
                  request={activeRequest}
                  onChange={(patch) => updateRequest(activeRequest.id, patch)}
                  onSend={send}
                  sending={sending}
                />
              </div>
              <div className="splitter" ref={splitRef} onMouseDown={startDrag} role="separator" />
              <ResponsePanel
                response={responses[activeRequest.id] ?? null}
                tests={testResults[activeRequest.id] ?? []}
                loading={sending}
              />
            </div>
          ) : (
            <div className="response-empty" style={{ flex: 1 }}>
              <div className="response-empty-inner">
                <div className="icon-wrap">
                  <FilePlus2 size={22} />
                </div>
                <h3>选择或新建一个接口</h3>
                <p>从左侧集合中选择接口，或点击「新建请求」开始调试。</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <RunnerModal run={run} onClose={() => setRun(null)} />
    </div>
  )
}
