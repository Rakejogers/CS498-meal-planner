-- Guard rail: every table in `public` must have row level security turned on.
-- If this fails, the new table needs `alter table ... enable row level security`
-- plus policies in its migration.
begin;
select plan(1);

select is_empty(
  $$
    select c.relname::text
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  $$,
  'every public table has RLS enabled'
);

select * from finish();
rollback;
