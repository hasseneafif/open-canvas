import { notFound } from "next/navigation";
import { ShareViewer } from "./ShareViewer";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { Client } from "@langchain/langgraph-sdk";
import { LANGGRAPH_API_URL } from "@/constants";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  const lgClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl: LANGGRAPH_API_URL,
  });

  let artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;

  try {
    const item = await lgClient.store.getItem(["shares"], `share::${id}`);
    if (!item) notFound();
    artifactContent = item.value as ArtifactCodeV3 | ArtifactMarkdownV3;
  } catch {
    notFound();
  }

  return <ShareViewer artifactContent={artifactContent!} />;
}
