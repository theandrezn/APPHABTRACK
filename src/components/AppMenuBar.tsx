import { useState } from 'react'
import {
  BadgeDollarSign,
  Bookmark,
  Check,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Gauge,
  Hand,
  HeartPulse,
  Home,
  ListTodo,
  MapPinned,
  Plane,
  Salad,
  Search,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import type { AddOn, AddOnCategory } from '../types/addon'
import { Button } from './Button'

const addOns: AddOn[] = [
  { id: 'travel-planner', name: 'Travel Planner', description: 'Plan trips, expenses and itinerary in one place.', category: 'Planners', price: 5, paymentLink: 'https://buy.stripe.com/4gM7sLcGp1Is3VQ4HF7N600', icon: Plane, featured: true, features: ['Trip overview', 'Daily itinerary', 'Travel budget', 'Packing checklist'] },
  { id: 'task-planner', name: 'Task Planner', description: 'Turn goals into a clear daily execution board.', category: 'Productivity', price: 5, paymentLink: 'https://buy.stripe.com/3cIcN535P5YIfEyb637N601', icon: ListTodo, features: ['Priority board', 'Due dates', 'Completion score', 'Weekly review'] },
  { id: 'goal-planner', name: 'Goal Planner', description: 'Break large goals into milestones and actions.', category: 'Productivity', price: 5, paymentLink: 'https://buy.stripe.com/bJe8wPayhfzicsmb637N602', icon: Target, features: ['Goal map', 'Milestones', 'Action steps', 'Progress view'] },
  { id: 'budget-planner', name: 'Budget Planner', description: 'Track monthly income, spending and savings.', category: 'Finance', price: 5, paymentLink: 'https://buy.stripe.com/28E28r9ud1Is9ga8XV7N603', icon: WalletCards, features: ['Budget overview', 'Expense tracker', 'Savings goal', 'Category breakdown'] },
  { id: 'meal-planner', name: 'Meal Planner', description: 'Organize meals, groceries and nutrition habits.', category: 'Wellness', price: 4.9, paymentLink: 'https://buy.stripe.com/4gM3cv21L4UE63Y6PN7N604', icon: Salad, features: ['Weekly meals', 'Grocery list', 'Meal prep', 'Nutrition notes'] },
  { id: 'workout-planner', name: 'Workout Planner', description: 'Create training routines and track consistency.', category: 'Wellness', price: 4.9, paymentLink: 'https://buy.stripe.com/5kQ14n21L86QfEy0rp7N605', icon: Dumbbell, features: ['Workout split', 'Exercise log', 'Weekly volume', 'Progress notes'] },
  { id: 'focus-planner', name: 'Focus Planner', description: 'Protect deep work sessions and attention.', category: 'Productivity', price: 4.9, paymentLink: 'https://buy.stripe.com/6oUaEX21Ldra9ga3DB7N606', icon: Gauge, features: ['Focus blocks', 'Distraction log', 'Session score', 'Weekly focus review'] },
  { id: 'self-care-planner', name: 'Self-Care Planner', description: 'Build a practical wellness routine.', category: 'Wellness', price: 4.9, paymentLink: 'https://buy.stripe.com/28EbJ17m586QgIC5LJ7N607', icon: HeartPulse, features: ['Mood log', 'Self-care routine', 'Reflection prompts', 'Weekly balance'] },
]

const categories: AddOnCategory[] = ['Planners', 'Productivity', 'Wellness', 'Finance']
const OWNED_KEY = 'habit-game:add-ons:v1'
const categoryIcons = {
  Planners: Hand,
  Productivity: UserRound,
  Wellness: Bookmark,
  Finance: Settings,
} satisfies Record<AddOnCategory, AddOn['icon']>

function loadOwned() {
  try {
    return JSON.parse(window.localStorage.getItem(OWNED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function AppMenuBar() {
  const [openCategory, setOpenCategory] = useState<AddOnCategory | null>(null)
  const [selected, setSelected] = useState<AddOn | null>(null)
  const [owned, setOwned] = useState<string[]>(loadOwned)

  const addModule = (addOn: AddOn) => {
    const next = owned.includes(addOn.id) ? owned : [...owned, addOn.id]
    setOwned(next)
    window.localStorage.setItem(OWNED_KEY, JSON.stringify(next))
  }

  const openCheckout = (addOn: AddOn) => {
    addModule(addOn)
    window.open(addOn.paymentLink, '_blank', 'noopener,noreferrer')
    setSelected(null)
  }

  return (
    <>
      <nav className="app-menubar" aria-label="Habit Game modules">
        <button className="menubar-icon menubar-home is-active" type="button" aria-label="Dashboard">
          <Home size={16} />
          <span>Dashboard</span>
        </button>
        <button className="menubar-icon" type="button" aria-label="Search add-ons" onClick={() => setSelected(addOns[0])}>
          <Search size={17} />
          <span>Search</span>
        </button>
        {categories.map((category) => (
          <div className="menubar-group" key={category}>
            {(() => {
              const CategoryIcon = categoryIcons[category]
              return (
                <button
                  className={`menubar-icon menubar-trigger ${openCategory === category ? 'is-open' : ''}`}
                  type="button"
                  aria-label={`${category} add-ons`}
                  aria-expanded={openCategory === category}
                  onClick={() => setOpenCategory((current) => current === category ? null : category)}
                >
                  <CategoryIcon size={17} />
                  <span>{category}</span>
                  <ChevronDown className="menubar-caret" size={10} />
                </button>
              )
            })()}
            {openCategory === category && (
              <div className="menubar-dropdown">
                {addOns.filter((item) => item.category === category).map((item) => {
                  const Icon = item.icon
                  const isOwned = owned.includes(item.id)
                  return (
                    <button
                      className="menubar-item"
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelected(item)
                        setOpenCategory(null)
                      }}
                    >
                      <Icon size={16} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>{isOwned ? 'Checkout link opened' : `Stripe checkout - $${item.price.toFixed(2)}`}</small>
                      </span>
                      {isOwned && <Check className="menubar-check" size={15} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        <button className="menubar-icon menubar-marketplace" type="button" aria-label="Open add-ons marketplace" onClick={() => setSelected(addOns[0])}>
          <BadgeDollarSign size={17} />
          <span>Add-ons</span>
          <span>{addOns.length}</span>
        </button>
      </nav>

      {selected && (
        <div className="modal-backdrop" role="presentation">
          <div className="addon-modal" role="dialog" aria-modal="true" aria-labelledby="addon-title">
            <button className="addon-close" type="button" aria-label="Close add-on" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
            <div className="addon-heading">
              <div className="addon-icon"><selected.icon size={25} /></div>
              <div>
                <span>{selected.category} Add-on</span>
                <h2 id="addon-title">{selected.name}</h2>
                <p>{selected.description}</p>
              </div>
            </div>
            <div className="addon-body">
              <div>
                <div className="addon-proof">
                  <span><ShieldCheck size={14} /> Secure Stripe checkout</span>
                  <span><CreditCard size={14} /> One-time payment</span>
                </div>
                <div className="addon-feature-list">
                  {selected.features.map((feature) => (
                    <div key={feature}><ClipboardCheck size={15} />{feature}</div>
                  ))}
                </div>
              </div>
              <div className="addon-price-card">
                <small>Order bump</small>
                <strong>${selected.price.toFixed(2)}</strong>
                <span>Instant checkout link</span>
              </div>
            </div>
            <div className="addon-actions">
              <Button onClick={() => setSelected(null)}>Not now</Button>
              <Button
                tone="lime"
                onClick={() => openCheckout(selected)}
              >
                <ExternalLink size={15} />
                {owned.includes(selected.id) ? 'Open Checkout Again' : `Buy ${selected.name}`}
              </Button>
            </div>
            <button className="addon-browse" type="button" onClick={() => setSelected(addOns[(addOns.indexOf(selected) + 1) % addOns.length])}>
              <MapPinned size={14} />
              Browse next add-on
            </button>
          </div>
        </div>
      )}
    </>
  )
}
