import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const schemaHint = {
  query: ["viewer", "patients", "providers", "appointments", "medicalRecords"],
  mutation: ["createPatient", "createProvider", "createAppointment", "createMedicalRecord"],
};

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ errors: [{ message: "Unauthorized" }] }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { query?: string } | null;

  if (!body?.query) {
    return NextResponse.json({ errors: [{ message: "GraphQL query is required." }] }, { status: 400 });
  }

  if (body.query.includes("health")) {
    return NextResponse.json({ data: { health: "ok" } });
  }

  return NextResponse.json(
    {
      errors: [{ message: "GraphQL resolver not implemented in starter scaffold." }],
      schemaHint,
    },
    { status: 501 },
  );
}
