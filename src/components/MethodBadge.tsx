import type { HttpMethod } from '../types'

export function MethodBadge({ method }: { method: HttpMethod }) {
  return <span className={`method method-${method}`}>{method}</span>
}
