import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3 =
    body.artifactContent;

  if (!artifactContent) {
    return NextResponse.json(
      { error: "`artifactContent` is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shares")
    .insert({ artifact_content: artifactContent })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create share:", error);
    return NextResponse.json(
      { error: "Failed to create share." },
      { status: 500 }
    );
  }

  return NextResponse.json({ shareId: data.id }, { status: 201 });
}
