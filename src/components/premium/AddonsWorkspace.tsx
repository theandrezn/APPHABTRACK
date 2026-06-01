import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Plus,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react'
import { PREMIUM_ADDONS, getPremiumAddon } from '../../data/addonsConfig'
import { Button } from '../Button'
import { AddonCard } from './AddonCard'
import type { AppView } from '../../types/navigation'

type AddonsWorkspaceProps = {
  ownerId: string | null
  activeView: AppView
  onNavigate: (view: AppView) => void
}

type MoneyEntry = {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  description: string
}

type ADHDData = {
  focus: string
  priorities: Array<{ id: string; text: string; done: boolean }>
  microSteps: Array<{ id: string; text: string; done: boolean }>
  distractions: string[]
  wins: string[]
  secondsLeft: number
  mode: 'focus' | 'break'
}

type MindItem = {
  id: string
  text: string
  type: 'Task' | 'Worry' | 'Idea' | 'Reminder' | 'Later'
  priority: 'Low' | 'Medium' | 'High'
  nextAction: string
  status: 'Open' | 'Completed'
}

const moneyCategories = ['Housing', 'Food', 'Transport', 'Health', 'Subscriptions', 'Entertainment', 'Debt', 'Savings', 'Other']
const mindTypes: MindItem['type'][] = ['Task', 'Worry', 'Idea', 'Reminder', 'Later']

function storageKey(ownerId: string | null, key: string) {
  return `habit-game:addon:v1:${ownerId ?? 'local'}:${key}`
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function useStoredState<T>(ownerId: string | null, key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = window.localStorage.getItem(storageKey(ownerId, key))
    if (!raw) return initialValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    queueMicrotask(() => {
      const raw = window.localStorage.getItem(storageKey(ownerId, key))
      if (!raw) {
        setValue(initialValue)
        return
      }
      try {
        setValue(JSON.parse(raw) as T)
      } catch {
        setValue(initialValue)
      }
    })
  }, [initialValue, key, ownerId])

  useEffect(() => {
    window.localStorage.setItem(storageKey(ownerId, key), JSON.stringify(value))
  }, [key, ownerId, value])

  return [value, setValue] as const
}

function exportJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function AddonsWorkspace({ ownerId, activeView, onNavigate }: AddonsWorkspaceProps) {
  const selectedAddon = activeView === 'addons' || activeView === 'dashboard' ? null : getPremiumAddon(activeView)

  return (
    <main className="premium-workspace" aria-label="HabTrack premium add-ons">
      <header className="premium-hero">
        <div>
          <span>Premium Workspace</span>
          <h1>{selectedAddon?.name ?? 'Complementos'}</h1>
          <p>{selectedAddon?.description ?? 'Unlock focused systems that live inside your HabTrack dashboard.'}</p>
        </div>
        <div className="premium-tabs" aria-label="Premium add-on tabs">
          <button className={activeView === 'addons' ? 'is-active' : ''} type="button" onClick={() => onNavigate('addons')}>All</button>
          {PREMIUM_ADDONS.map((addon) => (
            <button className={activeView === addon.id ? 'is-active' : ''} key={addon.id} type="button" onClick={() => onNavigate(addon.id)}>
              {addon.shortName}
            </button>
          ))}
        </div>
      </header>

      {activeView === 'addons' && (
        <section className="premium-addon-grid">
          {PREMIUM_ADDONS.map((addon) => (
            <AddonCard key={addon.id} addon={addon} onOpen={() => onNavigate(addon.id)} />
          ))}
        </section>
      )}

      {activeView === 'moneyPlanner' && <MoneyPlannerPage ownerId={ownerId} />}
      {activeView === 'adhdProductivity' && <ADHDProductivityPage ownerId={ownerId} />}
      {activeView === 'clearMind' && <ClearMindPage ownerId={ownerId} />}
      {activeView === 'lifetimeUpdates' && <LifetimeUpdatesPage />}
    </main>
  )
}

function MoneyPlannerPage({ ownerId }: { ownerId: string | null }) {
  const initialEntries = useMemo<MoneyEntry[]>(() => [], [])
  const [entries, setEntries] = useStoredState(ownerId, 'money-planner', initialEntries)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Omit<MoneyEntry, 'id'>>({
    type: 'expense',
    category: 'Housing',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
  })

  const income = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0)
  const expenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.max(0, (balance / income) * 100) : 0
  const categoryTotals = moneyCategories.map((category) => ({
    category,
    value: entries.filter((entry) => entry.category === category && entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0),
  }))
  const maxCategory = Math.max(1, ...categoryTotals.map((item) => item.value))

  const addEntry = () => {
    if (!form.description.trim() || form.amount <= 0) return
    setEntries((current) => [{ id: makeId('money'), ...form, amount: Number(form.amount) }, ...current])
    setForm((current) => ({ ...current, amount: 0, description: '' }))
  }

  return (
    <section className="premium-page">
      <div className="money-toolbar">
        <label>Month <input type="month" defaultValue={new Date().toISOString().slice(0, 7)} /></label>
        <label>Currency <select defaultValue="USD"><option>USD</option></select></label>
        <Button onClick={() => exportJson('habtrack-money-planner.json', entries)}><Download size={15} /> Export JSON</Button>
        <Button onClick={() => fileRef.current?.click()}><Upload size={15} /> Import JSON</Button>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const imported = JSON.parse(String(reader.result)) as MoneyEntry[]
                if (Array.isArray(imported)) setEntries(imported)
              } catch {
                window.alert('Invalid money planner JSON.')
              }
            }
            reader.readAsText(file)
            event.currentTarget.value = ''
          }}
        />
      </div>

      <div className="premium-summary-grid">
        <SummaryCard label="Income" value={`$${income.toFixed(2)}`} />
        <SummaryCard label="Expenses" value={`$${expenses.toFixed(2)}`} />
        <SummaryCard label="Balance" value={`$${balance.toFixed(2)}`} />
        <SummaryCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
      </div>

      <div className="money-layout">
        <section className="premium-panel">
          <h2>Transactions</h2>
          <div className="money-form">
            <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as MoneyEntry['type'] }))}>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {moneyCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <input type="number" min="0" step="0.01" value={form.amount || ''} placeholder="Amount" onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} />
            <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <input value={form.description} placeholder="Description" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <Button tone="lime" onClick={addEntry}><Plus size={15} /> Add</Button>
          </div>
          <div className="premium-list">
            {entries.length === 0 && <EmptyState text="No transactions yet. Add your first income or expense." />}
            {entries.map((entry) => (
              <div className="money-row" key={entry.id}>
                <span>{entry.type}</span>
                <strong>{entry.description}</strong>
                <small>{entry.category} / {entry.date}</small>
                <b className={entry.type === 'income' ? 'positive' : 'negative'}>{entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}</b>
                <button type="button" aria-label="Delete transaction" onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-panel">
          <h2>Categories</h2>
          {categoryTotals.map((item) => (
            <div className="category-bar" key={item.category}>
              <span>{item.category}</span>
              <div><i style={{ width: `${(item.value / maxCategory) * 100}%` }} /></div>
              <strong>${item.value.toFixed(0)}</strong>
            </div>
          ))}
        </section>
      </div>
    </section>
  )
}

function ADHDProductivityPage({ ownerId }: { ownerId: string | null }) {
  const initial = useMemo<ADHDData>(() => ({
    focus: '',
    priorities: Array.from({ length: 3 }, (_, index) => ({ id: makeId(`priority-${index}`), text: '', done: false })),
    microSteps: [],
    distractions: [],
    wins: [],
    secondsLeft: 25 * 60,
    mode: 'focus',
  }), [])
  const [data, setData] = useStoredState(ownerId, 'adhd-productivity', initial)
  const [isRunning, setIsRunning] = useState(false)
  const [microStep, setMicroStep] = useState('')
  const [distraction, setDistraction] = useState('')
  const [win, setWin] = useState('')
  const totalItems = data.priorities.length + data.microSteps.length
  const doneItems = [...data.priorities, ...data.microSteps].filter((item) => item.done).length
  const progress = totalItems > 0 ? (doneItems / totalItems) * 100 : 0

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      setData((current) => {
        if (current.secondsLeft > 1) return { ...current, secondsLeft: current.secondsLeft - 1 }
        const nextMode = current.mode === 'focus' ? 'break' : 'focus'
        return { ...current, mode: nextMode, secondsLeft: nextMode === 'focus' ? 25 * 60 : 5 * 60 }
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isRunning, setData])

  const minutes = Math.floor(data.secondsLeft / 60).toString().padStart(2, '0')
  const seconds = (data.secondsLeft % 60).toString().padStart(2, '0')

  return (
    <section className="premium-page adhd-grid">
      <div className="premium-panel">
        <h2>Today Focus</h2>
        <textarea value={data.focus} placeholder="What matters most today?" onChange={(event) => setData((current) => ({ ...current, focus: event.target.value }))} />
      </div>
      <div className="premium-panel timer-panel">
        <h2>Focus Timer</h2>
        <strong>{minutes}:{seconds}</strong>
        <span>{data.mode === 'focus' ? 'Focus sprint' : 'Recovery break'}</span>
        <div>
          <Button tone="lime" onClick={() => setIsRunning((current) => !current)}>{isRunning ? 'Pause' : 'Start'}</Button>
          <Button onClick={() => setData((current) => ({ ...current, secondsLeft: current.mode === 'focus' ? 25 * 60 : 5 * 60 }))}>Reset</Button>
        </div>
      </div>
      <div className="premium-panel">
        <h2>Top 3 Priorities</h2>
        {data.priorities.map((item, index) => (
          <label className="check-line" key={item.id}>
            <input type="checkbox" checked={item.done} onChange={() => setData((current) => ({ ...current, priorities: current.priorities.map((priority) => priority.id === item.id ? { ...priority, done: !priority.done } : priority) }))} />
            <input value={item.text} placeholder={`Priority ${index + 1}`} onChange={(event) => setData((current) => ({ ...current, priorities: current.priorities.map((priority) => priority.id === item.id ? { ...priority, text: event.target.value } : priority) }))} />
          </label>
        ))}
      </div>
      <div className="premium-panel">
        <h2>Micro Steps</h2>
        <InlineAdd value={microStep} placeholder="Tiny next step" onChange={setMicroStep} onAdd={() => {
          if (!microStep.trim()) return
          setData((current) => ({ ...current, microSteps: [...current.microSteps, { id: makeId('step'), text: microStep.trim(), done: false }] }))
          setMicroStep('')
        }} />
        <TaskList items={data.microSteps} onToggle={(id) => setData((current) => ({ ...current, microSteps: current.microSteps.map((item) => item.id === id ? { ...item, done: !item.done } : item) }))} />
      </div>
      <div className="premium-panel">
        <h2>Distraction Parking Lot</h2>
        <InlineAdd value={distraction} placeholder="Park a distraction" onChange={setDistraction} onAdd={() => {
          if (!distraction.trim()) return
          setData((current) => ({ ...current, distractions: [distraction.trim(), ...current.distractions] }))
          setDistraction('')
        }} />
        <SimpleList items={data.distractions} />
      </div>
      <div className="premium-panel">
        <h2>Win Log</h2>
        <div className="progress-meter"><i style={{ width: `${progress}%` }} /></div>
        <InlineAdd value={win} placeholder="Small win" onChange={setWin} onAdd={() => {
          if (!win.trim()) return
          setData((current) => ({ ...current, wins: [win.trim(), ...current.wins] }))
          setWin('')
        }} />
        <SimpleList items={data.wins} />
      </div>
    </section>
  )
}

function ClearMindPage({ ownerId }: { ownerId: string | null }) {
  const initialItems = useMemo<MindItem[]>(() => [], [])
  const [items, setItems] = useStoredState(ownerId, 'clear-mind', initialItems)
  const [draft, setDraft] = useState('')

  const capture = () => {
    if (!draft.trim()) return
    setItems((current) => [{ id: makeId('mind'), text: draft.trim(), type: 'Task', priority: 'Medium', nextAction: '', status: 'Open' }, ...current])
    setDraft('')
  }

  return (
    <section className="premium-page clear-mind-page">
      <div className="premium-panel brain-dump">
        <h2>Clear Mind</h2>
        <textarea value={draft} placeholder="Write everything on your mind..." onChange={(event) => setDraft(event.target.value)} />
        <div>
          <Button tone="lime" onClick={capture}>Capture</Button>
          <Button onClick={() => setItems((current) => current.filter((item) => item.status !== 'Completed'))}>Clear Completed</Button>
          <Button onClick={() => window.print()}><Printer size={15} /> Download / Print PDF</Button>
        </div>
      </div>
      <div className="mind-columns">
        {mindTypes.map((type) => (
          <section className="premium-panel mind-column" key={type}>
            <h2>{type}</h2>
            {items.filter((item) => item.type === type).length === 0 && <EmptyState text="Nothing here yet." />}
            {items.filter((item) => item.type === type).map((item) => (
              <article className="mind-card" key={item.id}>
                <textarea value={item.text} onChange={(event) => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, text: event.target.value } : currentItem))} />
                <select value={item.type} onChange={(event) => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, type: event.target.value as MindItem['type'] } : currentItem))}>
                  {mindTypes.map((mindType) => <option key={mindType}>{mindType}</option>)}
                </select>
                <select value={item.priority} onChange={(event) => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, priority: event.target.value as MindItem['priority'] } : currentItem))}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
                <input value={item.nextAction} placeholder="Next action" onChange={(event) => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, nextAction: event.target.value } : currentItem))} />
                <button type="button" onClick={() => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, status: currentItem.status === 'Completed' ? 'Open' : 'Completed' } : currentItem))}>
                  <CheckCircle2 size={15} /> {item.status}
                </button>
              </article>
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}

function LifetimeUpdatesPage() {
  const updates = [
    { version: '1.2.0', date: '2026-06-01', title: 'Premium Add-ons Workspace', description: 'Added native money, ADHD, clear mind and updates dashboards.' },
    { version: '1.1.0', date: '2026-05-31', title: 'Reward Motion', description: 'Progress ring now reacts with smooth motion when habits are completed.' },
    { version: '1.0.0', date: '2026-05-30', title: 'HabTrack Launch', description: 'Initial habit dashboard, sleep tracker, import/export and secure login.' },
  ]

  return (
    <section className="premium-page lifetime-page">
      <div className="premium-panel lifetime-status">
        <span>Lifetime Updates Active</span>
        <h2>Your HabTrack system keeps improving.</h2>
        <p>Future improvements, new templates, new dashboards, bug fixes and performance updates are included.</p>
      </div>
      <div className="premium-addon-grid">
        {['Future improvements', 'New templates', 'New dashboards', 'Bug fixes', 'Performance updates'].map((item) => (
          <article className="benefit-card" key={item}><CheckCircle2 size={20} />{item}</article>
        ))}
      </div>
      <section className="premium-panel changelog">
        <h2>Changelog</h2>
        {updates.map((update) => (
          <article key={update.version}>
            <span>{update.version} / {update.date}</span>
            <h3>{update.title}</h3>
            <p>{update.description}</p>
          </article>
        ))}
      </section>
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <article className="premium-summary-card"><span>{label}</span><strong>{value}</strong></article>
}

function EmptyState({ text }: { text: string }) {
  return <p className="premium-empty">{text}</p>
}

function InlineAdd({ value, placeholder, onChange, onAdd }: { value: string; placeholder: string; onChange: (value: string) => void; onAdd: () => void }) {
  return (
    <div className="inline-add">
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onAdd() }} />
      <Button tone="lime" onClick={onAdd}><Plus size={15} /> Add</Button>
    </div>
  )
}

function TaskList({ items, onToggle }: { items: Array<{ id: string; text: string; done: boolean }>; onToggle: (id: string) => void }) {
  return (
    <div className="task-list">
      {items.map((item) => (
        <label key={item.id} className="check-line">
          <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
          <span>{item.text}</span>
        </label>
      ))}
    </div>
  )
}

function SimpleList({ items }: { items: string[] }) {
  return <div className="simple-list">{items.map((item) => <span key={item}>{item}</span>)}</div>
}
