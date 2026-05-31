import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Habit } from '../types/habit'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

type ManageHabitsModalProps = {
  habits: Habit[]
  onCancel: () => void
  onSave: (habits: Habit[]) => void
}

const habitPresets: Array<Omit<Habit, 'id'>> = [
  { name: 'Drink Water', emoji: '💧', active: true, color: '#62D0FF' },
  { name: '10k Steps', emoji: '🚶', active: true, color: '#8BEA25' },
  { name: 'Meditation', emoji: '🧘', active: true, color: '#B99CFF' },
  { name: 'Deep Work', emoji: '⚡', active: true, color: '#FFD166' },
  { name: 'Healthy Meals', emoji: '🥗', active: true, color: '#7BEA5B' },
  { name: 'Read 20 Minutes', emoji: '📚', active: true, color: '#74D9FF' },
  { name: 'No Sugar', emoji: '🚫', active: true, color: '#FF8B7B' },
  { name: 'Plan Tomorrow', emoji: '📋', active: true, color: '#FFB35C' },
]

export function ManageHabitsModal({ habits, onCancel, onSave }: ManageHabitsModalProps) {
  const [draft, setDraft] = useState<Habit[]>(() => habits.map((habit) => ({ ...habit })))
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const hasEmptyName = useMemo(() => draft.some((habit) => habit.name.trim().length === 0), [draft])

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setDraft((current) => current.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)))
  }

  const addHabit = (preset?: Omit<Habit, 'id'>) => {
    const id = `habit-${crypto.randomUUID()}`
    setDraft((current) => [
      ...current,
      preset ? { id, ...preset } : { id, name: 'New Habit', emoji: '✓', active: true, color: '#8BEA25' },
    ])
  }

  const removeHabit = (id: string) => {
    setDraft((current) => current.filter((habit) => habit.id !== id))
    setDeleteId(null)
  }

  return (
    <>
      <div className="modal-backdrop" role="presentation">
        <div className="manage-modal" role="dialog" aria-modal="true" aria-labelledby="manage-title">
          <div className="modal-header">
            <div>
              <h2 id="manage-title">Manage Habits</h2>
              <p>Edit the active scoreboard for this month.</p>
            </div>
            <Button onClick={() => addHabit()} aria-label="Add custom habit">
              <Plus size={16} />
              Custom Habit
            </Button>
          </div>

          <div className="habit-presets">
            <div>
              <strong>Quick Add</strong>
              <span>Start with a preset, then customize every field.</span>
            </div>
            <div className="habit-preset-grid">
              {habitPresets.map((preset) => (
                <button type="button" key={preset.name} className="habit-preset" onClick={() => addHabit(preset)}>
                  <span>{preset.emoji}</span>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="habit-editor-list">
            {draft.map((habit) => (
              <div className="habit-editor-row" key={habit.id}>
                <label>
                  <span>Name</span>
                  <input
                    value={habit.name}
                    onChange={(event) => updateHabit(habit.id, { name: event.target.value })}
                  />
                </label>
                <label className="emoji-field">
                  <span>Emoji</span>
                  <input
                    value={habit.emoji}
                    maxLength={4}
                    onChange={(event) => updateHabit(habit.id, { emoji: event.target.value })}
                  />
                </label>
                <label className="color-field">
                  <span>Color</span>
                  <input
                    type="color"
                    value={habit.color ?? '#8BEA25'}
                    aria-label={`${habit.name} color`}
                    onChange={(event) => updateHabit(habit.id, { color: event.target.value })}
                  />
                </label>
                <label className="active-field">
                  <input
                    type="checkbox"
                    checked={habit.active}
                    onChange={(event) => updateHabit(habit.id, { active: event.target.checked })}
                  />
                  <span>Active</span>
                </label>
                <Button tone="danger" aria-label={`Remove ${habit.name}`} onClick={() => setDeleteId(habit.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          {hasEmptyName && <p className="form-error">Habit names cannot be empty.</p>}

          <div className="modal-actions">
            <Button onClick={onCancel}>Cancel</Button>
            <Button tone="lime" disabled={hasEmptyName} onClick={() => onSave(draft.map((habit) => ({ ...habit, name: habit.name.trim() })))}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Remove Habit"
          message="This removes the habit from this month and hides its completion history."
          confirmLabel="Remove Habit"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => removeHabit(deleteId)}
        />
      )}
    </>
  )
}
