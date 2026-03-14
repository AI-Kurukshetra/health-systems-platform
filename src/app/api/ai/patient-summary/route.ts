import { NextRequest, NextResponse } from "next/server";

import { extractRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPatientHistoryContext, generatePatientHistorySummary } from "@/modules/dashboard/server";

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (extractRole(user) !== "provider") {
    return NextResponse.json({ error: "Only doctors can generate patient summaries." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { patientProfileId?: unknown } | null;
  const patientProfileId = toTrimmedString(body?.patientProfileId);

  if (!patientProfileId) {
    return NextResponse.json({ error: "patientProfileId is required." }, { status: 400 });
  }

  try {
    const context = await buildPatientHistoryContext(patientProfileId);
    const summary = await generatePatientHistorySummary(context);

    return NextResponse.json({
      patientProfileId: context.patientProfileId,
      patientName: context.patientName,
      summary: summary.summary,
      keyRisks: summary.keyRisks,
      suggestedNextActions: summary.suggestedNextActions,
      sourceCounts: {
        medicalRecords: context.medicalRecords.length,
        symptoms: context.symptoms.length,
        appointments: context.appointments.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate patient summary.";
    const status = message === "Patient profile not found." ? 404 : message === "Missing OPENAI_API_KEY" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
