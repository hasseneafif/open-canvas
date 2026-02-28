import { v4 as uuidv4 } from "uuid";
import {
  OpenCanvasGraphAnnotation,
  OpenCanvasGraphReturnType,
} from "../../state.js";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { optionallyUpdateArtifactMeta } from "./update-meta.js";
import {
  buildPrompt,
  createNewArtifactContent,
  formatFilesForPrompt,
  validateState,
} from "./utils.js";
import {
  createContextDocumentMessages,
  getFormattedReflections,
  getModelConfig,
  getModelFromConfig,
  isUsingO1MiniModel,
  optionallyGetSystemPromptFromConfig,
} from "../../../utils.js";
import {
  isArtifactCodeContent,
  isArtifactMarkdownContent,
} from "@opencanvas/shared/utils/artifacts";
import { AIMessage } from "@langchain/core/messages";
import {
  extractThinkingAndResponseTokens,
  isThinkingModel,
} from "@opencanvas/shared/utils/thinking";
import { MULTI_FILE_REWRITE_SCHEMA } from "../generate-artifact/schemas.js";
import { UPDATE_ENTIRE_ARTIFACT_PROMPT } from "../../prompts.js";

export const rewriteArtifact = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  const { modelName } = getModelConfig(config);
  const smallModelWithConfig = (await getModelFromConfig(config)).withConfig({
    runName: "rewrite_artifact_model_call",
  });
  const memoriesAsString = await getFormattedReflections(config);
  const { currentArtifactContent, recentHumanMessage } = validateState(state);

  const artifactMetaToolCall = await optionallyUpdateArtifactMeta(
    state,
    config
  );
  const artifactType = artifactMetaToolCall.type;
  const isNewType = artifactType !== currentArtifactContent.type;

  const contextDocumentMessages = await createContextDocumentMessages(config);
  const isO1MiniModel = isUsingO1MiniModel(config);
  const userSystemPrompt = optionallyGetSystemPromptFromConfig(config);

  // --- Multi-file branch: use structured output so files are returned as JSON ---
  if (
    isArtifactCodeContent(currentArtifactContent) &&
    currentArtifactContent.files &&
    currentArtifactContent.files.length > 1 &&
    !isNewType
  ) {
    const filesPrompt = formatFilesForPrompt(currentArtifactContent.files);
    const multiFileSystemPrompt = UPDATE_ENTIRE_ARTIFACT_PROMPT.replace(
      "{artifactContent}",
      filesPrompt
    )
      .replace("{reflections}", memoriesAsString)
      .replace("{updateMetaPrompt}", "");

    const fullSystemPrompt = userSystemPrompt
      ? `${userSystemPrompt}\n${multiFileSystemPrompt}`
      : multiFileSystemPrompt;

    const multiFileModel = (await getModelFromConfig(config))
      .withStructuredOutput(MULTI_FILE_REWRITE_SCHEMA, {
        name: "rewrite_multi_file_artifact",
      })
      .withConfig({ runName: "rewrite_multi_file_artifact_call" });

    const result = await multiFileModel.invoke([
      { role: isO1MiniModel ? "user" : "system", content: fullSystemPrompt },
      ...contextDocumentMessages,
      recentHumanMessage,
    ]);

    const newArtifactContent = createNewArtifactContent({
      artifactType,
      state,
      currentArtifactContent,
      artifactMetaToolCall,
      newContent: result.files[0]?.content ?? "",
      newFiles: result.files,
    });

    return {
      artifact: {
        ...state.artifact,
        currentIndex: state.artifact.contents.length + 1,
        contents: [...state.artifact.contents, newArtifactContent],
      },
    };
  }

  // --- Single-file branch (original behaviour, unchanged) ---
  const artifactContent = isArtifactMarkdownContent(currentArtifactContent)
    ? currentArtifactContent.fullMarkdown
    : currentArtifactContent.code;

  const formattedPrompt = buildPrompt({
    artifactContent,
    memoriesAsString,
    isNewType,
    artifactMetaToolCall,
  });

  const fullSystemPrompt = userSystemPrompt
    ? `${userSystemPrompt}\n${formattedPrompt}`
    : formattedPrompt;

  const newArtifactResponse = await smallModelWithConfig.invoke([
    { role: isO1MiniModel ? "user" : "system", content: fullSystemPrompt },
    ...contextDocumentMessages,
    recentHumanMessage,
  ]);

  let thinkingMessage: AIMessage | undefined;
  let artifactContentText = newArtifactResponse.content as string;

  if (isThinkingModel(modelName)) {
    const { thinking, response } =
      extractThinkingAndResponseTokens(artifactContentText);
    thinkingMessage = new AIMessage({
      id: `thinking-${uuidv4()}`,
      content: thinking,
    });
    artifactContentText = response;
  }

  const newArtifactContent = createNewArtifactContent({
    artifactType,
    state,
    currentArtifactContent,
    artifactMetaToolCall,
    newContent: artifactContentText as string,
  });

  return {
    artifact: {
      ...state.artifact,
      currentIndex: state.artifact.contents.length + 1,
      contents: [...state.artifact.contents, newArtifactContent],
    },
    messages: [...(thinkingMessage ? [thinkingMessage] : [])],
    _messages: [...(thinkingMessage ? [thinkingMessage] : [])],
  };
};
