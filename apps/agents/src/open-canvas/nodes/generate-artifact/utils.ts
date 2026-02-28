import { NEW_ARTIFACT_PROMPT } from "../../prompts.js";
import {
  ArtifactCodeV3,
  ArtifactFile,
  ArtifactMarkdownV3,
  ProgrammingLanguageOptions,
} from "@opencanvas/shared/types";
import { z } from "zod";
import { ARTIFACT_TOOL_SCHEMA } from "./schemas.js";

export const formatNewArtifactPrompt = (
  memoriesAsString: string,
  modelName: string
): string => {
  return NEW_ARTIFACT_PROMPT.replace("{reflections}", memoriesAsString).replace(
    "{disableChainOfThought}",
    modelName.includes("claude")
      ? "\n\nIMPORTANT: Do NOT preform chain of thought beforehand. Instead, go STRAIGHT to generating the tool response. This is VERY important."
      : ""
  );
};

/**
 * If the model concatenated multiple files into a single `artifact` string using
 * comment-header separators (e.g. `# main.py`, `// index.ts`), split them into
 * proper ArtifactFile entries. Returns null if no split pattern is detected.
 */
function trySplitConcatenatedFiles(code: string): ArtifactFile[] | null {
  const separatorRe = /^(?:#|\/\/)\s+([\w.-]+\.\w+)\s*$/gm;
  const matches = [...code.matchAll(separatorRe)];
  if (matches.length < 2) return null;

  const files: ArtifactFile[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const filename = match[1];
    const contentStart = match.index! + match[0].length;
    const contentEnd =
      i + 1 < matches.length ? matches[i + 1].index! : code.length;
    const content = code.slice(contentStart, contentEnd).trim();
    files.push({ filename, content });
  }
  return files.length >= 2 ? files : null;
}

export const createArtifactContent = (
  toolCall: z.infer<typeof ARTIFACT_TOOL_SCHEMA>
): ArtifactCodeV3 | ArtifactMarkdownV3 => {
  const artifactType = toolCall?.type;

  if (artifactType === "code") {
    // If the model used `files` correctly, honour it.
    let files = toolCall.files && toolCall.files.length > 1 ? toolCall.files : undefined;

    // Fallback: if the model concatenated everything into `artifact`, split it.
    if (!files && toolCall.artifact) {
      files = trySplitConcatenatedFiles(toolCall.artifact) ?? undefined;
    }

    const firstFileContent = files?.[0]?.content ?? toolCall?.artifact ?? "";

    return {
      index: 1,
      type: "code",
      title: toolCall?.title,
      code: firstFileContent,
      language: toolCall?.language as ProgrammingLanguageOptions,
      ...(files ? { files } : {}),
    };
  }

  return {
    index: 1,
    type: "text",
    title: toolCall?.title,
    fullMarkdown: toolCall?.artifact ?? "",
  };
};
