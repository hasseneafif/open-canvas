import { PROGRAMMING_LANGUAGES } from "@opencanvas/shared/constants";
import { z } from "zod";

export const ARTIFACT_FILE_SCHEMA = z.object({
  filename: z
    .string()
    .describe(
      "The filename including extension, e.g. 'index.ts', 'App.tsx', 'styles.css'."
    ),
  content: z.string().describe("The full content of this file."),
});

export const ARTIFACT_TOOL_SCHEMA = z.object({
  type: z
    .enum(["code", "text"])
    .describe("The content type of the artifact generated."),
  language: z
    .enum(
      PROGRAMMING_LANGUAGES.map((lang) => lang.language) as [
        string,
        ...string[],
      ]
    )
    .optional()
    .describe(
      "The language/programming language of the artifact generated.\n" +
        "If generating code, it should be one of the options, or 'other'.\n" +
        "If not generating code, the language should ALWAYS be 'other'.\n" +
        "For multi-file artifacts use the language of the primary file."
    ),
  isValidReact: z
    .boolean()
    .optional()
    .describe(
      "Whether or not the generated code is valid React code. Only populate this field if generating code."
    ),
  artifact: z
    .string()
    .optional()
    .describe(
      "The content of a single-file code artifact or any text artifact. " +
        "NEVER use this field if the user's request mentions multiple named files " +
        "(e.g. 'main.py and utils.py', 'App.tsx and Button.tsx'). " +
        "Use `files` instead in those cases."
    ),
  files: z
    .array(ARTIFACT_FILE_SCHEMA)
    .optional()
    .describe(
      "An array of files for multi-file code artifacts. " +
        "Use this INSTEAD of `artifact` when the output spans multiple files. " +
        "REQUIRED whenever: (1) the user names 2 or more files explicitly, or " +
        "(2) the code would logically be split into separate named source files. " +
        "Do NOT concatenate multiple files into `artifact` with comment headers like " +
        "'# filename.py' — put each file as a separate entry here. " +
        "Each file must have a unique `filename` with an appropriate extension."
    ),
  title: z
    .string()
    .describe(
      "A short title to give to the artifact. Should be less than 5 words."
    ),
});

/** Schema used when rewriting a multi-file code artifact. */
export const MULTI_FILE_REWRITE_SCHEMA = z.object({
  files: z
    .array(ARTIFACT_FILE_SCHEMA)
    .describe(
      "The updated files. Return ALL files from the original artifact, " +
        "including files that were not changed. Preserve filenames exactly."
    ),
});
