drop function if exists assign_bed_to_student(uuid, uuid);

create or replace function assign_student_to_room(p_room_id uuid, p_student_id uuid)
returns void
language plpgsql
as $$
declare
  v_bed_id uuid;
  v_student_room uuid;
begin
  select room_id into v_student_room from students where id = p_student_id;
  if v_student_room is not null then
    raise exception 'Student is already assigned to a room';
  end if;

  -- Lock one free bed in this room so two simultaneous assignments
  -- can't grab the same bed — this is what actually prevents the race
  -- condition your AGENT.md flags, at the DB level, not the frontend
  select id into v_bed_id
  from beds
  where room_id = p_room_id and student_id is null
  order by bed_label
  limit 1
  for update skip locked;

  if v_bed_id is null then
    raise exception 'No vacant beds in this room';
  end if;

  update beds set student_id = p_student_id, status = 'occupied' where id = v_bed_id;
  update students set room_id = p_room_id where id = p_student_id;
end;
$$;