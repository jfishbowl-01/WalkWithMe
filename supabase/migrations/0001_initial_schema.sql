create extension if not exists pgcrypto;
create extension if not exists postgis;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  home_privacy_center geography(Point, 4326),
  home_privacy_radius_meters integer not null default 200,
  created_at timestamptz not null default now()
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  geometry geography(MultiPolygon, 4326),
  created_at timestamptz not null default now()
);

create table if not exists public.street_segments (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions(id) on delete set null,
  osm_way_id bigint,
  name text,
  highway_type text,
  access text,
  foot text,
  surface text,
  geometry geography(LineString, 4326),
  length_meters double precision,
  is_walkable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  started_at timestamptz,
  ended_at timestamptz,
  distance_meters double precision,
  duration_seconds integer,
  route geography(LineString, 4326),
  notes text,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  constraint walks_visibility_check check (visibility in ('private', 'shared'))
);

create table if not exists public.walk_points (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks(id) on delete cascade,
  recorded_at timestamptz,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision,
  sequence_index integer not null
);

create table if not exists public.completed_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  street_segment_id uuid not null references public.street_segments(id) on delete cascade,
  first_completed_walk_id uuid references public.walks(id) on delete set null,
  completed_at timestamptz not null default now(),
  completion_ratio double precision,
  unique (user_id, street_segment_id)
);

create table if not exists public.walk_segment_matches (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks(id) on delete cascade,
  street_segment_id uuid not null references public.street_segments(id) on delete cascade,
  matched_length_meters double precision,
  segment_length_meters double precision,
  completion_ratio double precision,
  counted_as_completed boolean not null default false
);

create table if not exists public.walk_photos (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks(id) on delete cascade,
  storage_path text,
  caption text,
  taken_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_created_at on public.profiles (created_at);
create index if not exists idx_regions_type on public.regions (type);
create index if not exists idx_street_segments_region_id on public.street_segments (region_id);
create index if not exists idx_street_segments_osm_way_id on public.street_segments (osm_way_id);
create index if not exists idx_street_segments_is_walkable on public.street_segments (is_walkable);
create index if not exists idx_walks_user_id on public.walks (user_id);
create index if not exists idx_walks_started_at on public.walks (started_at desc);
create index if not exists idx_walk_points_walk_id on public.walk_points (walk_id);
create index if not exists idx_walk_points_walk_id_sequence on public.walk_points (walk_id, sequence_index);
create index if not exists idx_completed_segments_user_id on public.completed_segments (user_id);
create index if not exists idx_completed_segments_street_segment_id on public.completed_segments (street_segment_id);
create index if not exists idx_walk_segment_matches_walk_id on public.walk_segment_matches (walk_id);
create index if not exists idx_walk_segment_matches_street_segment_id on public.walk_segment_matches (street_segment_id);
create index if not exists idx_walk_photos_walk_id on public.walk_photos (walk_id);

create index if not exists idx_regions_geometry on public.regions using gist (geometry);
create index if not exists idx_street_segments_geometry on public.street_segments using gist (geometry);
create index if not exists idx_walks_route on public.walks using gist (route);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on table public.street_segments is
  'Initial framework uses mock browser GeoJSON. Replace with OSM-derived Cambridge segment import in a later phase.';

comment on table public.walk_segment_matches is
  'Stores per-walk segment matching diagnostics for completion debugging and future manual override workflows.';

comment on column public.profiles.home_privacy_center is
  'Future privacy-safe sharing should blur or clip route geometry near this point.';

comment on column public.street_segments.geometry is
  'TODO: Import real Cambridge walkable street/path segments from OSM, split between intersections, and preserve OSM metadata.';

-- Made with Bob
