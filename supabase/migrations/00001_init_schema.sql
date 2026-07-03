-- =========================================
-- ENUMS
-- =========================================
create type user_role as enum ('superadmin', 'manager', 'staff');
create type room_status as enum ('vacant', 'reserved', 'occupied');
create type bed_status as enum ('vacant', 'occupied');
create type student_status as enum ('active', 'inactive', 'graduated');
create type attendance_status as enum ('present', 'absent', 'leave');
create type leave_status as enum ('pending', 'approved', 'rejected');

-- =========================================
-- HOSTELS
-- =========================================
create table hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

-- =========================================
-- USERS (mirrors auth.users, extends with role/hostel)
-- =========================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null,
  hostel_id uuid references hostels(id) on delete set null,
  created_at timestamptz not null default now(),
  -- superadmin must have null hostel_id; manager/staff must have one
  constraint role_hostel_check check (
    (role = 'superadmin' and hostel_id is null) or
    (role in ('manager', 'staff') and hostel_id is not null)
  )
);

-- =========================================
-- ROOMS
-- =========================================
create table rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id) on delete cascade,
  room_number text not null,
  capacity int not null check (capacity > 0),
  status room_status not null default 'vacant',
  created_at timestamptz not null default now(),
  unique (hostel_id, room_number)
);

-- =========================================
-- STUDENTS
-- =========================================
create table students (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id) on delete cascade,
  name text not null,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  document_urls text[] default '{}',
  room_id uuid references rooms(id) on delete set null,
  status student_status not null default 'active',
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =========================================
-- BEDS
-- =========================================
create table beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  bed_label text not null, -- e.g. 'A', 'B', 'Bed 1'
  student_id uuid references students(id) on delete set null,
  status bed_status not null default 'vacant',
  created_at timestamptz not null default now(),
  unique (room_id, bed_label),
  -- THE critical constraint: a student can only occupy one bed, ever
  unique (student_id)
);

-- =========================================
-- ATTENDANCE
-- =========================================
create table attendance (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  status attendance_status not null,
  marked_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

-- =========================================
-- LEAVE REQUESTS
-- =========================================
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status not null default 'pending',
  approved_by uuid references users(id),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- =========================================
-- INDEXES (RLS filters on hostel_id constantly — index it everywhere)
-- =========================================
create index idx_users_hostel on users(hostel_id);
create index idx_rooms_hostel on rooms(hostel_id);
create index idx_students_hostel on students(hostel_id);
create index idx_students_room on students(room_id);
create index idx_beds_room on beds(room_id);
create index idx_attendance_hostel on attendance(hostel_id);
create index idx_attendance_student on attendance(student_id);
create index idx_leave_hostel on leave_requests(hostel_id);
create index idx_leave_student on leave_requests(student_id);