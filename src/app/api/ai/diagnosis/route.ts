import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateAIDiagnosis, parseSymptomSubmission } from "@/modules/symptoms/server";

function readRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;

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

  if (readRole(user) !== "patient") {
    return NextResponse.json({ error: "Only patients can request AI diagnosis." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = parseSymptomSubmission(body);

  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error ?? "Invalid request." }, { status: 400 });
  }

  try {
    const diagnosis = await generateAIDiagnosis(parsed.data);
    const serializedDiagnosis = JSON.stringify(diagnosis);

    const { data, error } = await supabase
      .from("symptoms")
      .insert({
        patient_user_id: user.id,
        description: parsed.data.symptoms,
        age: parsed.data.age,
        gender: parsed.data.gender,
        ai_diagnosis: serializedDiagnosis,
      })
      .select("id, patient_user_id, description, age, gender, ai_diagnosis, created_at, updated_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to save diagnosis." }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      symptoms: data.description,
      age: data.age,
      gender: data.gender,
      aiDiagnosis: diagnosis,
      createdAt: data.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI diagnosis failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
