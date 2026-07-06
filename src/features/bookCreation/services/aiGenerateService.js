import { toAiGenerateRequest, toBookDraft } from "../utils/bookDraftMapper";

const AI_GENERATE_URL = "http://localhost:8080/api/ai/generate";

const LOG_TASK_TYPES = new Set(["WRITE_PAGE", "WRITE_SCENE"]);

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data.message || data.detail || data.error || fallback;
};

export const extractGeneratedText = (data) => {
  const result = data?.result || data?.data?.result || data;

  if (!result || typeof result === "string") return result || "";

  const generated =
    result.text ||
    result.body ||
    result.content ||
    result.pageText ||
    result.sceneText ||
    result.page ||
    result.scene ||
    result.generatedText ||
    "";

  if (typeof generated === "string") return generated;
  if (generated && typeof generated === "object") {
    return generated.body || generated.text || generated.content || "";
  }

  return "";
};

export const extractGeneratedPages = (data) => {
  const result = data?.result || data?.data?.result || data;
  return Array.isArray(result?.pages) ? result.pages : [];
};

export const extractGeneratedScenes = (data) => {
  const result = data?.result || data?.data?.result || data;
  return Array.isArray(result?.scenes) ? result.scenes : [];
};

export const requestAiGenerate = async ({
  taskType,
  draft,
  extra = {},
  signal,
} = {}) => {
  if (!taskType) {
    return {
      ok: false,
      status: 0,
      message: "taskType is required.",
      data: null,
    };
  }

  if (!draft) {
    return {
      ok: false,
      status: 0,
      message: "draft is required.",
      data: null,
    };
  }

  try {
    const requestBody = {
      bookId: extra?.bookId ?? draft?.bookId ?? null,
      bookType: draft?.bookType,
      creationMode: draft?.meta?.interactionMode,
      authorAgeGroup: draft?.meta?.writerLevel,
      readerAgeGroup: draft?.meta?.readerAge,
      stage: taskType,
      message: extra?.message ?? "",
      pageNo: extra?.pageNo ?? null,
      context: { draft, extra },
    };

    if (LOG_TASK_TYPES.has(taskType)) {
      console.log("[AI REQUEST]", requestBody);
    }

    const response = await fetch(AI_GENERATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      const result = {
        ok: false,
        status: response.status,
        message: extractMessage(data, response.statusText || "AI request failed."),
        data,
      };

      if (LOG_TASK_TYPES.has(taskType)) {
        console.log("[AI RESPONSE]", result);
      }

      return result;
    }

    const result = {
      ok: true,
      status: response.status,
      message: extractMessage(data, "OK"),
      data,
    };

    if (LOG_TASK_TYPES.has(taskType)) {
      console.log("[AI RESPONSE]", result);
    }

    return result;
  } catch (error) {
    const result = {
      ok: false,
      status: 0,
      message: error?.message || "AI request failed.",
      data: null,
      error,
    };

    if (LOG_TASK_TYPES.has(taskType)) {
      console.log("[AI RESPONSE]", result);
    }

    return result;
  }
};

export const generateAiContent = (taskType, state, extra = {}, options = {}) =>
  requestAiGenerate({
    taskType,
    draft: toBookDraft(state),
    extra,
    ...options,
  });

export const normalizeSetting = (state, extra, options) =>
  generateAiContent("NORMALIZE_SETTING", state, extra, options);

export const createPagePlan = (state, extra, options) =>
  generateAiContent("CREATE_PAGE_PLAN", state, extra, options);

export const writePage = (state, extra, options) =>
  generateAiContent("WRITE_PAGE", state, extra, options);

export const createScenePlan = (state, extra, options) =>
  generateAiContent("CREATE_SCENE_PLAN", state, extra, options);

export const writeScene = (state, extra, options) =>
  generateAiContent("WRITE_SCENE", state, extra, options);

export const createImagePrompt = (state, extra, options) =>
  generateAiContent("CREATE_IMAGE_PROMPT", state, extra, options);

export const createCoverPrompt = (state, extra, options) =>
  generateAiContent("CREATE_COVER_PROMPT", state, extra, options);

export const makeAiGenerateRequest = toAiGenerateRequest;

export const aiGenerateService = {
  requestAiGenerate,
  generateAiContent,
  extractGeneratedText,
  extractGeneratedPages,
  extractGeneratedScenes,
  normalizeSetting,
  createPagePlan,
  writePage,
  createScenePlan,
  writeScene,
  createImagePrompt,
  createCoverPrompt,
  makeAiGenerateRequest,
};
