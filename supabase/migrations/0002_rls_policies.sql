alter table public.profiles enable row level security;
alter table public.regions enable row level security;
alter table public.street_segments enable row level security;
alter table public.walks enable row level security;
alter table public.walk_points enable row level security;
alter table public.completed_segments enable row level security;
alter table public.walk_segment_matches enable row level security;
alter table public.walk_photos enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "regions_read_authenticated"
on public.regions
for select
to authenticated
using (true);

create policy "street_segments_read_authenticated"
on public.street_segments
for select
to authenticated
using (true);

create policy "walks_select_own"
on public.walks
for select
to authenticated
using (auth.uid() = user_id);

create policy "walks_insert_own"
on public.walks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "walks_update_own"
on public.walks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "walks_delete_own"
on public.walks
for delete
to authenticated
using (auth.uid() = user_id);

create policy "walk_points_select_own"
on public.walk_points
for select
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_points.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_points_insert_own"
on public.walk_points
for insert
to authenticated
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_points.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_points_update_own"
on public.walk_points
for update
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_points.walk_id
      and public.walks.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_points.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_points_delete_own"
on public.walk_points
for delete
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_points.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "completed_segments_select_own"
on public.completed_segments
for select
to authenticated
using (auth.uid() = user_id);

create policy "completed_segments_insert_own"
on public.completed_segments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "completed_segments_update_own"
on public.completed_segments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "completed_segments_delete_own"
on public.completed_segments
for delete
to authenticated
using (auth.uid() = user_id);

create policy "walk_segment_matches_select_own"
on public.walk_segment_matches
for select
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_segment_matches.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_segment_matches_insert_own"
on public.walk_segment_matches
for insert
to authenticated
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_segment_matches.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_segment_matches_update_own"
on public.walk_segment_matches
for update
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_segment_matches.walk_id
      and public.walks.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_segment_matches.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_segment_matches_delete_own"
on public.walk_segment_matches
for delete
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_segment_matches.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_photos_select_own"
on public.walk_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_photos.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_photos_insert_own"
on public.walk_photos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_photos.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_photos_update_own"
on public.walk_photos
for update
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_photos.walk_id
      and public.walks.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_photos.walk_id
      and public.walks.user_id = auth.uid()
  )
);

create policy "walk_photos_delete_own"
on public.walk_photos
for delete
to authenticated
using (
  exists (
    select 1
    from public.walks
    where public.walks.id = public.walk_photos.walk_id
      and public.walks.user_id = auth.uid()
  )
);

-- Made with Bob
