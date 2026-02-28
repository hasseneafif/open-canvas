import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";
import { LANGGRAPH_API_URL } from "@/constants";
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

  const shareId = crypto.randomUUID();

  const lgClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl: LANGGRAPH_API_URL,
  });

  try {
    await lgClient.store.putItem(["shares"], `share::${shareId}`, artifactContent);
  } catch (e) {
    console.error("Failed to create share:", e);
    return NextResponse.json(
      { error: "Failed to create share." },
      { status: 500 }
    );
  }

  return NextResponse.json({ shareId }, { status: 201 });
}
