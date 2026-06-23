-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create user_settings table
create table user_settings (
    user_id uuid references auth.users on delete cascade primary key,
    is_premium boolean default false,
    coins integer default 0,
    daily_message_count integer default 0,
    last_active_date date,
    has_accepted_disclaimer boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table
create table profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    relationship_type text,
    language text,
    personality text,
    speaking_style text,
    memories text,
    interests text,
    pet_names text,
    whatsapp_phrases jsonb,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table messages (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)

-- User Settings RLS
alter table user_settings enable row level security;
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- Profiles RLS
alter table profiles enable row level security;
create policy "Users can view own profiles" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profiles" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profiles" on profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profiles" on profiles for delete using (auth.uid() = user_id);

-- Messages RLS
alter table messages enable row level security;
create policy "Users can view own messages" on messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on messages for insert with check (auth.uid() = user_id);
create policy "Users can update own messages" on messages for update using (auth.uid() = user_id);
create policy "Users can delete own messages" on messages for delete using (auth.uid() = user_id);

-- Set up Storage for photos
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;

-- Set up Storage RLS policies
create policy "Photos are publicly accessible." on storage.objects for select using (bucket_id = 'photos');
create policy "Users can upload photos." on storage.objects for insert with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update own photos." on storage.objects for update using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own photos." on storage.objects for delete using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
