create table if not exists public.habit_game_addon_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  addon_id text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount_total integer,
  currency text,
  status text not null default 'paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, addon_id)
);

alter table public.habit_game_addon_purchases enable row level security;

drop policy if exists "Users can read their own Habit Game add-ons" on public.habit_game_addon_purchases;
create policy "Users can read their own Habit Game add-ons"
on public.habit_game_addon_purchases
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists habit_game_addon_purchases_user_id_idx
on public.habit_game_addon_purchases(user_id);

create index if not exists habit_game_addon_purchases_addon_id_idx
on public.habit_game_addon_purchases(addon_id);

create or replace function public.set_habit_game_addon_purchases_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_habit_game_addon_purchases_updated_at on public.habit_game_addon_purchases;
create trigger set_habit_game_addon_purchases_updated_at
before update on public.habit_game_addon_purchases
for each row
execute function public.set_habit_game_addon_purchases_updated_at();
