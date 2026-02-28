"use client";

import { ArtifactFile } from "@opencanvas/shared/types";
import { cn } from "@/lib/utils";

interface FileTabsProps {
  files: ArtifactFile[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function FileTabs({ files, activeIndex, onSelect }: FileTabsProps) {
  return (
    <div className="flex flex-row items-end gap-0 border-b border-gray-200 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
      {files.map((file, i) => (
        <button
          key={file.filename}
          onClick={() => onSelect(i)}
          className={cn(
            "px-3 py-1.5 text-sm font-mono whitespace-nowrap border-b-2 transition-colors",
            i === activeIndex
              ? "border-gray-800 text-gray-900 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {file.filename}
        </button>
      ))}
    </div>
  );
}

/** Derive a CodeMirror language name from a filename extension. */
export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return "cpp";
    case "java":
      return "java";
    case "php":
      return "php";
    case "html":
    case "htm":
      return "html";
    case "sql":
      return "sql";
    case "json":
      return "json";
    case "rs":
      return "rust";
    case "xml":
      return "xml";
    case "clj":
    case "cljs":
      return "clojure";
    case "cs":
      return "csharp";
    case "css":
    case "scss":
    case "less":
      return "css";
    case "md":
    case "mdx":
      return "markdown";
    default:
      return "other";
  }
}
