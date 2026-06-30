-- Create profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  avatar_url text,
  role text default 'user' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  plan_name text not null, -- e.g., Free, Student, Professional, Enterprise
  status text not null default 'active',
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.subscriptions enable row level security;
create policy "Users can view their own subscriptions" on subscriptions for select using (auth.uid() = user_id);

-- Create uploads table
create table public.uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  file_name text not null,
  file_size integer not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.uploads enable row level security;
create policy "Users can view their own uploads" on uploads for select using (auth.uid() = user_id);
create policy "Users can insert their own uploads" on uploads for insert with check (auth.uid() = user_id);
create policy "Users can delete their own uploads" on uploads for delete using (auth.uid() = user_id);

-- Create reports table (AI Analysis results)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  upload_id uuid references public.uploads on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  thread_density numeric,
  warp_count integer,
  weft_count integer,
  fabric_type text,
  confidence_score numeric,
  suggestions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reports enable row level security;
create policy "Users can view their own reports" on reports for select using (auth.uid() = user_id);
create policy "Users can insert their own reports" on reports for insert with check (auth.uid() = user_id);
create policy "Users can delete their own reports" on reports for delete using (auth.uid() = user_id);

-- Create contact messages table
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for contact messages (anyone can insert, only admins can view)
alter table public.contact_messages enable row level security;
create policy "Anyone can insert contact messages" on contact_messages for insert with check (true);
create policy "Admins can view contact messages" on contact_messages for select using (
  auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.notifications enable row level security;
create policy "Users can view their own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on notifications for update using (auth.uid() = user_id);
