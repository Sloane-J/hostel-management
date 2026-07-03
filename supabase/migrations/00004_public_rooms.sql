alter table rooms add column category text;

-- Public, read-only, anonymous access — rooms table has no PII
create policy "public read rooms" on rooms
  for select to anon using (true);