import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateStructuredClinicalNote, parseClinicalNoteInput } from "@/modules/records/server";

function readRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  const userRole = user.user_metadata?.role;
  const appRole = user.app_metadata?.role;

  return typeof userRole === "string" ? userRole : typeof appRole === "string" ? appRole : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (readRole(user) !== "provider") {
    return NextResponse.json({ error: "Only doctors can create clinical notes." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = parseClinicalNoteInput(body);

  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error ?? "Invalid request." }, { status: 400 });
  }

  const { data: patientProfile, error: patientError } = await supabase
    .from("patient_profiles")
    .select("id, full_name")
    .eq("id", parsed.data.patientProfileId)
    .eq("provider_user_id", user.id)
    .single();

  if (patientError || !patientProfile) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  try {
    const structuredData = await generateStructuredClinicalNote(parsed.data.note);
    const { data, error } = await supabase
      .from("medical_records")
      .insert({
        patient_profile_id: patientProfile.id,
        provider_user_id: user.id,
        notes: parsed.data.note,
        structured_data: structuredData,
      })
      .select("id, patient_profile_id, provider_user_id, notes, structured_data, created_at, updated_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to save clinical note." }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      patientProfileId: data.patient_profile_id,
      patientName: patientProfile.full_name,
      notes: data.notes,
      structuredData,
      createdAt: data.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Clinical note generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
