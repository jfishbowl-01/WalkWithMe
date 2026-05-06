insert into public.regions (name, type, geometry)
select
  'Cambridge, Massachusetts',
  'city',
  st_multi(
    st_geogfromtext(
      'POLYGON((
        -71.1605 42.3502,
        -71.1605 42.4032,
        -71.0710 42.4032,
        -71.0710 42.3502,
        -71.1605 42.3502
      ))'
    )
  )
where not exists (
  select 1
  from public.regions
  where name = 'Cambridge, Massachusetts'
    and type = 'city'
);

comment on table public.regions is
  'Seeded with a coarse Cambridge placeholder polygon for initial app scaffolding. Replace with authoritative regional boundary data later.';

comment on table public.walks is
  'The local-first prototype stores walks in browser storage. Supabase persistence can replace or augment this when credentials are configured.';

-- Made with Bob
