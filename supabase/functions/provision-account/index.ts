// supabase/functions/provision-account/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Missing authorization", 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Caller-scoped client — only used to identify who's calling
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) return jsonError("Invalid session", 401);

    // Admin client — bypasses RLS and the public signup rate limit, service-side only
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("users")
      .select("role, hostel_id")
      .eq("id", user.id)
      .single();
    if (profileError || !callerProfile) return jsonError("Caller profile not found", 403);

    const body = await req.json();
    const { type } = body; // "manager" | "student" | "staff"

    if (type === "manager") {
      if (callerProfile.role !== "superadmin") return jsonError("Forbidden: superadmin only", 403);

      const { email, name, hostel_id, password } = body;
      if (!email || !name || !hostel_id || !password) return jsonError("Missing fields", 400);

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (createError) return jsonError(createError.message, 400);

      const { error: insertError } = await adminClient.from("users").insert({
        id: created.user.id, name, email, role: "manager", hostel_id,
      });
      if (insertError) return jsonError(insertError.message, 400);

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "student") {
      if (!["manager", "superadmin"].includes(callerProfile.role)) {
        return jsonError("Forbidden: manager or superadmin only", 403);
      }

      const {
        name, guardian_name, guardian_phone, guardian_email,
        preferred_category, login_email, password, hostel_id,
      } = body;
      if (!name || !guardian_name || !guardian_phone || !login_email || !password || !hostel_id) {
        return jsonError("Missing fields", 400);
      }

      // Managers can only onboard into their own hostel — superadmin can target any
      if (callerProfile.role === "manager" && callerProfile.hostel_id !== hostel_id) {
        return jsonError("Forbidden: hostel mismatch", 403);
      }

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: login_email, password, email_confirm: true,
      });
      if (createError) return jsonError(createError.message, 400);

      const { data: studentRow, error: insertError } = await adminClient
        .from("students")
        .insert({
          hostel_id, name, guardian_name, guardian_phone,
          guardian_email: guardian_email || null,
          preferred_category: preferred_category || null,
          auth_user_id: created.user.id,
          login_email,
          status: "active",
        })
        .select()
        .single();
      if (insertError) return jsonError(insertError.message, 400);

      return new Response(JSON.stringify({ success: true, student_id: studentRow.id }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "staff") {
      if (callerProfile.role !== "manager") {
        return jsonError("Forbidden: manager only", 403);
      }

      const { name, email, password } = body;
      if (!name || !email || !password) return jsonError("Missing fields", 400);

      // hostel_id is taken from the caller's own profile server-side —
      // never trust hostel_id from the request body here.
      const hostel_id = callerProfile.hostel_id;

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (createError) return jsonError(createError.message, 400);

      const { error: insertError } = await adminClient.from("users").insert({
        id: created.user.id, name, email, role: "staff", hostel_id, status: "active",
      });
      if (insertError) return jsonError(insertError.message, 400);

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return jsonError("Invalid type", 400);
  } catch (err) {
    return jsonError(err.message, 500);
  }
});