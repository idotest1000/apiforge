import { Plus, Trash2 } from 'lucide-react'
import type { KeyValue } from '../types'
import { uid } from '../id'

interface Props {
  items: KeyValue[]
  onChange: (items: KeyValue[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  showEnabled?: boolean
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  showEnabled = true,
}: Props) {
  const update = (id: string, patch: Partial<KeyValue>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  const remove = (id: string) => {
    onChange(items.filter((it) => it.id !== id))
  }

  const add = () => {
    onChange([...items, { id: uid('kv'), key: '', value: '', enabled: true }])
  }

  return (
    <div>
      <table className="kv-table">
        <thead>
          <tr>
            {showEnabled && <th className="kv-check" />}
            <th style={{ width: '34%' }}>{keyPlaceholder}</th>
            <th style={{ width: '56%' }}>{valuePlaceholder}</th>
            <th className="kv-remove" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {showEnabled && (
                <td className="kv-check">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => update(item.id, { enabled: e.target.checked })}
                    aria-label="启用"
                  />
                </td>
              )}
              <td>
                <input
                  className="kv-input"
                  value={item.key}
                  placeholder={keyPlaceholder}
                  onChange={(e) => update(item.id, { key: e.target.value })}
                  spellCheck={false}
                />
              </td>
              <td>
                <input
                  className="kv-input"
                  value={item.value}
                  placeholder={valuePlaceholder}
                  onChange={(e) => update(item.id, { value: e.target.value })}
                  spellCheck={false}
                />
              </td>
              <td className="kv-remove">
                <button className="icon-btn" onClick={() => remove(item.id)} aria-label="删除">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="kv-add" onClick={add}>
        <Plus size={14} />
        添加一行
      </button>
    </div>
  )
}
