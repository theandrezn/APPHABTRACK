# Habit Game

Habit Game is a premium dark-mode habit dashboard built with React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, and localStorage. It turns the reference habit tracker into a real interactive app with live progress, editable habits, editable sleep data, JSON import/export, and month-specific persistence.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173`.

## Edit Habits

Use `Manage Habits` in the top action bar. The modal lets you add habits, edit the name, edit the emoji, activate or deactivate a habit, and remove habits after confirmation. Empty habit names are blocked.

## Data Storage

All data is saved automatically in `localStorage` with one key per month:

```text
habit-game:v1:{supabaseUserId}:{year}-{month}
```

Changing month or year loads that month from localStorage. If no saved month exists, the app creates a fresh month using the current habit list. New accounts start with zero completions and zero sleep values; the sample data is only applied when the user clicks `Seed Example`.

## Supabase Signup Function

The app calls a public Supabase Edge Function named `habit-game-signup` when a new user creates an account. The function uses the Supabase service role inside the Edge runtime to create the user with `email_confirm: true`, then the frontend signs in normally with password auth.

Deploy command:

```bash
supabase functions deploy habit-game-signup --project-ref rbsrgfaqmpoidudpsqyd --no-verify-jwt
```

If deploy returns `403`, the current Supabase account does not have enough project privileges. In that case, either deploy with an owner/admin Supabase account or disable email confirmation in the Supabase dashboard under Authentication email provider settings.

## Export And Import JSON

Use `Export JSON` to download the current month as a JSON file. Use `Import JSON` to load a previously exported month. Imports are validated before they replace the current dashboard data.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```

## Stripe Webhook Unlock Flow

Order bumps use Stripe Payment Links. The app appends `client_reference_id={supabaseUserId}_{addonId}` and `prefilled_email` before opening checkout. Stripe sends `client_reference_id` back on `checkout.session.completed`, and the Supabase Edge Function `stripe-webhook` writes the paid add-on to `public.habit_game_addon_purchases`.

Webhook endpoint:

```text
https://rbsrgfaqmpoidudpsqyd.supabase.co/functions/v1/stripe-webhook
```

Stripe event to subscribe:

```text
checkout.session.completed
```

Required Supabase Edge Function secret:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

The table has RLS enabled, so authenticated users can only read add-ons unlocked for their own `auth.uid()`.
