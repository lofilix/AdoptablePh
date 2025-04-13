-- Create donation_type enum
create type donation_type as enum ('general', 'medical', 'shelter');

-- Create donation_status enum
create type donation_status as enum ('pending', 'completed', 'failed', 'refunded');

-- Create donations table
create table donations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  email text not null,
  amount integer not null check (amount >= 100),
  donation_type donation_type not null default 'general',
  status donation_status not null default 'pending',
  payment_intent_id text unique,
  payment_method text,
  receipt_url text,
  is_anonymous boolean not null default false,
  impact_report_sent boolean not null default false
);

-- Enable RLS
alter table donations enable row level security;

-- Create policies
create policy "Users can view their own donations"
  on donations for select
  using (auth.uid() = user_id);

create policy "Admins can view all donations"
  on donations for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Anyone can create a donation"
  on donations for insert
  with check (true);

create policy "System can update donation status"
  on donations for update
  using (true)
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    or 
    (auth.uid() = user_id and new.status = 'pending')
  );

-- Create function to update updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger donations_updated_at
  before update on donations
  for each row
  execute procedure handle_updated_at();

-- Create indexes
create index donations_user_id_idx on donations(user_id);
create index donations_status_idx on donations(status);
create index donations_created_at_idx on donations(created_at);
create index donations_payment_intent_id_idx on donations(payment_intent_id); 