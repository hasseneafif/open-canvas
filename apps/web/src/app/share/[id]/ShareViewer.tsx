"use client";

import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { rust } from "@codemirror/lang-rust";
import { xml } from "@codemirror/lang-xml";
import { clojure } from "@nextjournal/lang-clojure";
import { csharp } from "@replit/codemirror-lang-csharp";
import { cleanContent } from "@/lib/normalize_string";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useEffect } from "react";

function getLanguageExtension(language: string) {
  switch (language) {
    case "javascript":
      return javascript({ jsx: true, typescript: false });
    case "typescript":
      return javascript({ jsx: true, typescript: true });
    case "cpp":
      return cpp();
    case "java":
      return java();
    case "php":
      return php();
    case "python":
      return python();
    case "html":
      return html();
    case "sql":
      return sql();
    case "json":
      return json();
    case "rust":
      return rust();
    case "xml":
      return xml();
    case "clojure":
      return clojure();
    case "csharp":
      return csharp();
    default:
      return [];
  }
}

function CodeView({ artifact }: { artifact: ArtifactCodeV3 }) {
  return (
    <CodeMirror
      editable={false}
      value={cleanContent(artifact.code)}
      height="100vh"
      extensions={[
        getLanguageExtension(artifact.language),
        EditorView.theme({ "&": { fontSize: "14px" } }),
      ]}
    />
  );
}

function TextView({ artifact }: { artifact: ArtifactMarkdownV3 }) {
  const editor = useCreateBlockNote({});

  useEffect(() => {
    (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(
        artifact.fullMarkdown
      );
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [artifact.fullMarkdown]);

  return (
    <BlockNoteView
      theme="light"
      formattingToolbar={false}
      slashMenu={false}
      editable={false}
      editor={editor}
      className="pt-10"
    >
      <SuggestionMenuController
        getItems={async () =>
          getDefaultReactSlashMenuItems(editor).filter(
            (z) => z.group !== "Media"
          )
        }
        triggerCharacter="/"
      />
    </BlockNoteView>
  );
}

interface ShareViewerProps {
  artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
}

export function ShareViewer({ artifactContent }: ShareViewerProps) {
  return (
    <main className="w-full min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-3">
        <h1 className="text-base font-semibold text-gray-800 truncate">
          {artifactContent.title}
        </h1>
      </header>
      <div className="w-full">
        {artifactContent.type === "code" ? (
          <CodeView artifact={artifactContent as ArtifactCodeV3} />
        ) : (
          <TextView artifact={artifactContent as ArtifactMarkdownV3} />
        )}
      </div>
    </main>
  );
}
