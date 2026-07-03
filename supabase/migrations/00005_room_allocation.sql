-- Auto-sync a room's status whenever its beds change
create or replace function sync_room_status()
returns trigger
language plpgsql
as $$
declare
  v_room_id uuid;
  v_capacity int;
  v_occupied int;
begin
  v_room_id := coalesce(new.room_id, old.room_id);

  select capacity into v_capacity from rooms where id = v_room_id;
  select count(*) into v_occupied from beds where room_id = v_room_id and student_id is not null;

  update rooms
  set status = case
    when v_occupied = 0 then 'vacant'
    when v_occupied >= v_capacity then 'occupied'
    else 'reserved'
  end
  where id = v_room_id;

  return null;
end;
$$;

create trigger beds_sync_room_status
after insert or update or delete on beds
for each row execute function sync_room_status();

-- Assign a student to a specific bed — atomic, respects caller's existing RLS
create or replace function assign_bed_to_student(p_bed_id uuid, p_student_id uuid)
returns void
language plpgsql
as $$
declare
  v_bed_student uuid;
  v_bed_room uuid;
  v_student_room uuid;
begin
  select student_id, room_id into v_bed_student, v_bed_room from beds where id = p_bed_id;
  if v_bed_student is not null then
    raise exception 'Bed is already occupied';
  end if;

  select room_id into v_student_room from students where id = p_student_id;
  if v_student_room is not null then
    raise exception 'Student is already assigned to a room';
  end if;

  update beds set student_id = p_student_id, status = 'occupied' where id = p_bed_id;
  update students set room_id = v_bed_room where id = p_student_id;
end;
$$;

-- Free up a bed — atomic
create or replace function unassign_bed(p_bed_id uuid)
returns void
language plpgsql
as $$
declare
  v_student_id uuid;
begin
  select student_id into v_student_id from beds where id = p_bed_id;
  if v_student_id is null then
    raise exception 'Bed is already vacant';
  end if;

  update beds set student_id = null, status = 'vacant' where id = p_bed_id;
  update students set room_id = null where id = v_student_id;
end;
$$;