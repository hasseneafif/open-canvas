import { ArtifactCodeV3 } from "@opencanvas/shared/types";
import React, { MutableRefObject, useEffect } from "react";
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
import styles from "./CodeRenderer.module.css";
import { cleanContent } from "@/lib/normalize_string";
import { cn } from "@/lib/utils";
import { CopyText } from "./components/CopyText";
import { getArtifactContent } from "@opencanvas/shared/utils/artifacts";
import { useGraphContext } from "@/contexts/GraphContext";
import { getLanguageFromFilename } from "./FileTabs";

export interface CodeRendererProps {
  editorRef: MutableRefObject<EditorView | null>;
  isHovering: boolean;
  /** 0-based index of the active file tab. Used only for multi-file artifacts. */
  activeFileIndex: number;
}

export const getLanguageExtension = (language: string) => {
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
};

export function CodeRendererComponent(props: Readonly<CodeRendererProps>) {
  const { graphData } = useGraphContext();
  const {
    artifact,
    isStreaming,
    updateRenderedArtifactRequired,
    firstTokenReceived,
    setArtifactContent,
    setUpdateRenderedArtifactRequired,
  } = graphData;

  useEffect(() => {
    if (updateRenderedArtifactRequired) {
      setUpdateRenderedArtifactRequired(false);
    }
  }, [updateRenderedArtifactRequired]);

  if (!artifact) {
    return null;
  }

  const artifactContent = getArtifactContent(artifact) as ArtifactCodeV3;

  // --- Multi-file: show the active tab's file ---
  const activeFile =
    artifactContent.files && artifactContent.files.length > 1
      ? artifactContent.files[props.activeFileIndex] ??
        artifactContent.files[0]
      : null;

  const displayCode = activeFile ? activeFile.content : artifactContent.code;
  const displayLanguage = activeFile
    ? getLanguageFromFilename(activeFile.filename)
    : artifactContent.language;

  const extensions = [getLanguageExtension(displayLanguage)];

  if (!displayCode) {
    return null;
  }

  const isEditable = !isStreaming;

  const handleChange = (newCode: string) => {
    if (activeFile && artifactContent.files) {
      // Update the specific file inside the files array
      const updatedFiles = artifactContent.files.map((f, i) =>
        i === props.activeFileIndex ? { ...f, content: newCode } : f
      );
      setArtifactContent(artifactContent.index, newCode, updatedFiles);
    } else {
      setArtifactContent(artifactContent.index, newCode);
    }
  };

  return (
    <div className="relative">
      <style jsx global>{`
        .pulse-code .cm-content {
          animation: codePulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes codePulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
      {props.isHovering && (
        <div className="absolute top-0 right-4 z-10">
          <CopyText currentArtifactContent={artifactContent} />
        </div>
      )}
      <CodeMirror
        editable={isEditable}
        className={cn(
          "w-full min-h-full",
          styles.codeMirrorCustom,
          isStreaming && !firstTokenReceived ? "pulse-code" : ""
        )}
        value={cleanContent(displayCode)}
        height="800px"
        extensions={extensions}
        onChange={handleChange}
        onCreateEditor={(view) => {
          props.editorRef.current = view;
        }}
      />
    </div>
  );
}

export const CodeRenderer = React.memo(CodeRendererComponent);
