import { notFound } from "next/navigation";
import { ShareViewer } from "./ShareViewer";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { createClient } from "@/lib/supabase/server";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shares")
    .select("artifact_content")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const artifactContent = data.artifact_content as
    | ArtifactCodeV3
    | ArtifactMarkdownV3;

  return <ShareViewer artifactContent={artifactContent} />;
}
