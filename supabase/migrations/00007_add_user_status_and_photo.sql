-- =========================================
-- USER STATUS (active/inactive)
-- =========================================
create type user_status as enum ('active', 'inactive');

alter table users
  add column status user_status not null default 'active',
  add column photo_url text;

-- =========================================
-- PREVENT SELF-ESCALATION
-- Staff/managers editing their own row can never change
-- role or hostel_id, even if an RLS policy would allow the UPDATE.
-- Only bypassed when the acting request comes from the
-- provision-account Edge Function (service role key).
-- =========================================
create or replace function prevent_role_hostel_change()
returns trigger as $$
begin
  -- service_role (Edge Functions) bypasses this check entirely
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Cannot change role directly. Contact an administrator.';
  end if;

  if new.hostel_id is distinct from old.hostel_id then
    raise exception 'Cannot change hostel assignment directly. Contact an administrator.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_role_hostel_change
  before update on users
  for each row
  execute function prevent_role_hostel_change();