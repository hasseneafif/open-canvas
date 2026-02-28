import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";
import { LANGGRAPH_API_URL } from "@/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lgClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl: LANGGRAPH_API_URL,
  });

  try {
    const item = await lgClient.store.getItem(["shares"], `share::${id}`);

    if (!item) {
      return NextResponse.json({ error: "Share not found." }, { status: 404 });
    }

    return NextResponse.json({ artifactContent: item.value }, { status: 200 });
  } catch (e) {
    console.error("Failed to fetch share:", e);
    return NextResponse.json({ error: "Share not found." }, { status: 404 });
  }
}
