-- Migration: Add Smart Kitchen / Sustainability tables

-- Table: ai_meal_plans
create table if not exists ai_meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  input_items jsonb not null,
  suggestions jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ai_meal_plans_user on ai_meal_plans(user_id);

-- Table: expiration_items
create table if not exists expiration_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  item_name text not null,
  quantity numeric default 1,
  expires_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_expiration_items_user on expiration_items(user_id);

-- Table: sustainability_insights
create table if not exists sustainability_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  metric jsonb not null, -- arbitrary key/values (e.g., {"waste_saved": 12.5})
  source text,
  created_at timestamptz default now()
);
create index if not exists idx_sustainability_insights_user on sustainability_insights(user_id);

-- Table: waste_logs
create table if not exists waste_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb not null, -- {"eggs":2, "bread":1}
  estimated_cost numeric default 0,
  logged_at timestamptz default now()
);
create index if not exists idx_waste_logs_user on waste_logs(user_id);

-- trigger functions to update updated_at on update
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ai_meal_plans_updated_at
before update on ai_meal_plans
for each row
execute procedure update_updated_at_column();

create trigger expiration_items_updated_at
before update on expiration_items
for each row
execute procedure update_updated_at_column();

-- sustainability_insights and waste_logs are append-only; no update trigger needed
