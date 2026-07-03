import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

// Service role client — bypasses RLS. Never use this pattern in app code.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoConfirm: true },
});

const DEFAULT_PASSWORD = "TempPass123!"; // everyone resets on first login in real use

async function createAuthUser(email: string, name: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true, // skip email verification for seeded accounts
  });
  if (error) throw new Error(`Failed creating auth user ${email}: ${error.message}`);
  console.log(`✓ auth user created: ${email}`);
  return data.user.id;
}

async function seed() {
  // 1. Hostel
  const { data: hostel, error: hostelError } = await supabase
    .from("hostels")
    .insert({ name: "St. Example School Hostel", address: "Accra, Ghana" })
    .select()
    .single();
  if (hostelError) throw hostelError;
  console.log(`✓ hostel created: ${hostel.id}`);

  // 2. Superadmin
  const superadminAuthId = await createAuthUser("superadmin@example.com", "Super Admin");
  await supabase.from("users").insert({
    id: superadminAuthId,
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "superadmin",
    hostel_id: null,
  });
  console.log("✓ superadmin profile created");

  // 3. Manager (you need at least one to onboard students under, per your role model)
  const managerAuthId = await createAuthUser("manager@example.com", "Hostel Manager");
  await supabase.from("users").insert({
    id: managerAuthId,
    name: "Hostel Manager",
    email: "manager@example.com",
    role: "manager",
    hostel_id: hostel.id,
  });
  console.log("✓ manager profile created");

  // 4. Staff (3)
  const staffMembers = [
    { email: "staff1@example.com", name: "Staff One" },
    { email: "staff2@example.com", name: "Staff Two" },
    { email: "staff3@example.com", name: "Staff Three" },
  ];
  for (const staff of staffMembers) {
    const authId = await createAuthUser(staff.email, staff.name);
    await supabase.from("users").insert({
      id: authId,
      name: staff.name,
      email: staff.email,
      role: "staff",
      hostel_id: hostel.id,
    });
    console.log(`✓ staff profile created: ${staff.email}`);
  }

  // 5. Rooms (a few, with categories, so the landing page has real data too)
  const roomsToCreate = [
    { room_number: "101", category: "Standard", capacity: 4 },
    { room_number: "102", category: "Standard", capacity: 4 },
    { room_number: "201", category: "Deluxe", capacity: 2 },
    { room_number: "202", category: "Deluxe", capacity: 2 },
  ];
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .insert(roomsToCreate.map((r) => ({ ...r, hostel_id: hostel.id })))
    .select();
  if (roomsError) throw roomsError;
  console.log(`✓ ${rooms.length} rooms created`);

  // 6. Beds — auto-generate labels based on each room's capacity
  const bedsToCreate = rooms.flatMap((room) =>
    Array.from({ length: room.capacity }, (_, i) => ({
      room_id: room.id,
      bed_label: String.fromCharCode(65 + i), // A, B, C, D...
    }))
  );
  const { data: beds, error: bedsError } = await supabase
    .from("beds")
    .insert(bedsToCreate)
    .select();
  if (bedsError) throw bedsError;
  console.log(`✓ ${beds.length} beds created`);

  // 7. Students (6) — some assigned to beds, some not, to test both states
  const studentsToCreate = [
    { name: "Ama Mensah", email: "ama.mensah@example.com" },
    { name: "Kojo Boateng", email: "kojo.boateng@example.com" },
    { name: "Efua Owusu", email: "efua.owusu@example.com" },
    { name: "Kwame Asante", email: "kwame.asante@example.com" },
    { name: "Adjoa Darko", email: "adjoa.darko@example.com" },
    { name: "Yaw Appiah", email: "yaw.appiah@example.com" },
  ];

  for (let i = 0; i < studentsToCreate.length; i++) {
    const student = studentsToCreate[i];
    const authId = await createAuthUser(student.email, student.name);

    const { data: studentRow, error: studentError } = await supabase
      .from("students")
      .insert({
        hostel_id: hostel.id,
        name: student.name,
        guardian_name: `Guardian of ${student.name}`,
        guardian_phone: "0244000000",
        guardian_email: `guardian.${i}@example.com`,
        auth_user_id: authId,
        status: "active",
      })
      .select()
      .single();
    if (studentError) throw studentError;
    console.log(`✓ student created: ${student.name}`);

    // Assign the first 4 students to beds, leave 2 unassigned (vacant-room testing)
    if (i < beds.length) {
      await supabase
        .from("beds")
        .update({ student_id: studentRow.id, status: "occupied" })
        .eq("id", beds[i].id);
      await supabase.from("students").update({ room_id: beds[i].room_id }).eq("id", studentRow.id);
      console.log(`  → assigned to bed ${beds[i].bed_label}`);
    }
  }

  console.log("\n✅ Seed complete.");
  console.log(`\nLogin credentials (all use password: ${DEFAULT_PASSWORD}):`);
  console.log("  superadmin@example.com");
  console.log("  manager@example.com");
  console.log("  staff1@example.com / staff2@example.com / staff3@example.com");
  console.log("  ama.mensah@example.com (student, if you build student login into the app)");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});