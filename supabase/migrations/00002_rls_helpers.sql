-- Returns the calling user's role, bypassing RLS (prevents recursion)
create or replace function auth_user_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from users where id = auth.uid();
$$;

-- Returns the calling user's hostel_id, bypassing RLS
create or replace function auth_user_hostel_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select hostel_id from users where id = auth.uid();
$$;

-- Returns the student.id linked to the calling auth user, if any
create or replace function auth_student_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from students where auth_user_id = auth.uid();
$$;