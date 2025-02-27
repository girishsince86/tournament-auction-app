create table if not exists team_owner_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  profile_image_url text,
  sports_background text not null,
  notable_achievements text[] not null default '{}',
  team_role text not null,
  contact_email text,
  social_media jsonb not null default '{}',
  bio text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for faster lookups by user_id
create index if not exists team_owner_profiles_user_id_idx on team_owner_profiles(user_id);

-- Enable Row Level Security
alter table team_owner_profiles enable row level security;

-- Create policies
create policy "Users can view all team owner profiles"
  on team_owner_profiles for select
  using (true);

create policy "Users can insert their own profile"
  on team_owner_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on team_owner_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on team_owner_profiles for delete
  using (auth.uid() = user_id);

-- Create storage bucket for team owner images
insert into storage.buckets (id, name)
values ('team-owner-images', 'team-owner-images')
on conflict do nothing;

-- Set up storage policies
create policy "Anyone can view team owner images"
  on storage.objects for select
  using (bucket_id = 'team-owner-images');

create policy "Authenticated users can upload team owner images"
  on storage.objects for insert
  with check (
    bucket_id = 'team-owner-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own team owner images"
  on storage.objects for update
  using (
    bucket_id = 'team-owner-images'
    and auth.uid() = owner
  );

create policy "Users can delete their own team owner images"
  on storage.objects for delete
  using (
    bucket_id = 'team-owner-images'
    and auth.uid() = owner
  ); 