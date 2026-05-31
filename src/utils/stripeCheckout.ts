import type { User } from '@supabase/supabase-js'
import type { AddOn } from '../types/addon'

export function buildCheckoutUrl(addOn: AddOn, user: User) {
  const url = new URL(addOn.paymentLink)
  url.searchParams.set('client_reference_id', `${user.id}_${addOn.id}`)
  if (user.email) {
    url.searchParams.set('prefilled_email', user.email)
  }
  url.searchParams.set('utm_source', 'habit_game_app')
  url.searchParams.set('utm_medium', 'order_bump')
  url.searchParams.set('utm_campaign', addOn.id)
  return url.toString()
}
