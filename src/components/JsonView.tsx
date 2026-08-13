import type { ReactNode } from 'react'

interface Token {
  text: string
  className: string
}

function tokenize(json: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = json.length

  while (i < n) {
    const ch = json[i]

    if (ch === '"') {
      let j = i + 1
      while (j < n && json[j] !== '"') {
        if (json[j] === '\\') j++
        j++
      }
      j = Math.min(j + 1, n)
      const text = json.slice(i, j)
      let k = j
      while (k < n && /\s/.test(json[k])) k++
      const isKey = json[k] === ':'
      tokens.push({ text, className: isKey ? 'json-key' : 'json-string' })
      i = j
      continue
    }

    if (/[-\d]/.test(ch)) {
      let j = i + 1
      while (j < n && /[0-9.eE+-]/.test(json[j])) j++
      tokens.push({ text: json.slice(i, j), className: 'json-number' })
      i = j
      continue
    }

    const rest = json.slice(i)
    if (rest.startsWith('true')) {
      tokens.push({ text: 'true', className: 'json-boolean' })
      i += 4
      continue
    }
    if (rest.startsWith('false')) {
      tokens.push({ text: 'false', className: 'json-boolean' })
      i += 5
      continue
    }
    if (rest.startsWith('null')) {
      tokens.push({ text: 'null', className: 'json-null' })
      i += 4
      continue
    }

    tokens.push({ text: ch, className: '' })
    i++
  }

  return tokens
}

export function JsonView({ value }: { value: unknown }) {
  if (value === undefined || value === null) {
    return <span className="json-null">null</span>
  }
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  const tokens = tokenize(text)
  const nodes: ReactNode[] = tokens.map((t, idx) =>
    t.className ? (
      <span key={idx} className={t.className}>
        {t.text}
      </span>
    ) : (
      t.text
    ),
  )
  return <div className="json-view">{nodes}</div>
}
