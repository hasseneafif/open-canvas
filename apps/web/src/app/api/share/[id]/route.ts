import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shares")
    .select("artifact_content, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Share not found." }, { status: 404 });
  }

  return NextResponse.json(
    { artifactContent: data.artifact_content, createdAt: data.created_at },
    { status: 200 }
  );
}
