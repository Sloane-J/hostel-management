-- =========================================
-- ENABLE RLS EVERYWHERE
-- =========================================
alter table hostels enable row level security;
alter table users enable row level security;
alter table rooms enable row level security;
alter table students enable row level security;
alter table beds enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;

-- =========================================
-- HOSTELS — superadmin only manages; manager/staff read their own
-- =========================================
create policy "superadmin full access" on hostels
  for all using (auth_user_role() = 'superadmin');

create policy "manager/staff read own hostel" on hostels
  for select using (id = auth_user_hostel_id());

-- =========================================
-- USERS
-- =========================================
create policy "superadmin full access" on users
  for all using (auth_user_role() = 'superadmin');

create policy "manager reads own hostel staff" on users
  for select using (
    auth_user_role() = 'manager' and hostel_id = auth_user_hostel_id()
  );

create policy "manager creates staff in own hostel" on users
  for insert with check (
    auth_user_role() = 'manager'
    and hostel_id = auth_user_hostel_id()
    and role = 'staff'
  );

create policy "user reads own row" on users
  for select using (id = auth.uid());

-- =========================================
-- ROOMS
-- =========================================
create policy "superadmin full access" on rooms
  for all using (auth_user_role() = 'superadmin');

create policy "manager full access own hostel" on rooms
  for all using (
    auth_user_role() = 'manager' and hostel_id = auth_user_hostel_id()
  );

create policy "staff read own hostel" on rooms
  for select using (
    auth_user_role() = 'staff' and hostel_id = auth_user_hostel_id()
  );

-- =========================================
-- STUDENTS
-- =========================================
create policy "superadmin full access" on students
  for all using (auth_user_role() = 'superadmin');

create policy "manager full access own hostel" on students
  for all using (
    auth_user_role() = 'manager' and hostel_id = auth_user_hostel_id()
  );

create policy "staff read own hostel" on students
  for select using (
    auth_user_role() = 'staff' and hostel_id = auth_user_hostel_id()
  );

create policy "staff insert onboarding own hostel" on students
  for insert with check (
    auth_user_role() = 'staff' and hostel_id = auth_user_hostel_id()
  );

create policy "student reads own record" on students
  for select using (id = auth_student_id());

-- =========================================
-- BEDS
-- =========================================
create policy "superadmin full access" on beds
  for all using (auth_user_role() = 'superadmin');

create policy "manager full access own hostel" on beds
  for all using (
    auth_user_role() = 'manager'
    and room_id in (select id from rooms where hostel_id = auth_user_hostel_id())
  );

create policy "staff read own hostel" on beds
  for select using (
    auth_user_role() = 'staff'
    and room_id in (select id from rooms where hostel_id = auth_user_hostel_id())
  );

create policy "student reads own bed" on beds
  for select using (student_id = auth_student_id());

-- =========================================
-- ATTENDANCE
-- =========================================
create policy "superadmin full access" on attendance
  for all using (auth_user_role() = 'superadmin');

create policy "manager full access own hostel" on attendance
  for all using (
    auth_user_role() = 'manager' and hostel_id = auth_user_hostel_id()
  );

create policy "staff mark and read own hostel" on attendance
  for all using (
    auth_user_role() = 'staff' and hostel_id = auth_user_hostel_id()
  ) with check (
    auth_user_role() = 'staff'
    and hostel_id = auth_user_hostel_id()
    and marked_by = auth.uid()
  );

create policy "student reads own attendance" on attendance
  for select using (student_id = auth_student_id());

-- =========================================
-- LEAVE REQUESTS
-- =========================================
create policy "superadmin full access" on leave_requests
  for all using (auth_user_role() = 'superadmin');

create policy "manager approves own hostel" on leave_requests
  for all using (
    auth_user_role() = 'manager' and hostel_id = auth_user_hostel_id()
  );

create policy "staff read own hostel" on leave_requests
  for select using (
    auth_user_role() = 'staff' and hostel_id = auth_user_hostel_id()
  );

create policy "student reads and creates own leave requests" on leave_requests
  for select using (student_id = auth_student_id());

create policy "student creates own leave request" on leave_requests
  for insert with check (
    student_id = auth_student_id()
    and status = 'pending'
  );