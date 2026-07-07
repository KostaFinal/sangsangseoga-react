import { toAiGenerateRequest, toBookDraft } from "../utils/bookDraftMapper";

const AI_GENERATE_URL = "http://localhost:8080/api/ai/generate";
const AI_GENERATE_STREAM_URL = "http://localhost:8080/api/ai/generate/stream";

const LOG_TASK_TYPES = new Set(["WRITE_PAGE", "WRITE_SCENE"]);

const normalizeEnumValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return value;
};

const buildRequestBody = (taskType, draft, extra = {}) => ({
  bookId: extra?.bookId ?? draft?.bookId ?? null,
  bookType: normalizeEnumValue(draft?.bookType),
  creationMode: normalizeEnumValue(draft?.meta?.interactionMode),
  authorAgeGroup: normalizeEnumValue(draft?.meta?.writerLevel),
  readerAgeGroup: normalizeEnumValue(draft?.meta?.readerAge),
  stage: taskType,
  message: extra?.message ?? "",
  pageNo: extra?.pageNo ?? null,
  context: { draft, extra },
});

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
    const requestBody = buildRequestBody(taskType, draft, extra);

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

// 스트리밍은 항상 로딩 텍스트 갱신용 보조 수단이다. onError는 예외를 던지지 않고
// 콜백으로만 전달되므로, 호출부는 원인(네트워크/파싱/미지원 브라우저 등)과 무관하게
// 동일한 fallback 경로(non-stream 호출)로 이어갈 수 있다.
export const requestAiGenerateStream = async ({
  taskType,
  draft,
  extra = {},
  onDelta,
  onDone,
  onError,
  signal,
} = {}) => {
  if (!taskType || !draft) {
    onError?.("taskType과 draft가 필요합니다.");
    return;
  }

  try {
    const requestBody = buildRequestBody(taskType, draft, extra);

    const response = await fetch(AI_GENERATE_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok || !response.body) {
      onError?.(`AI 스트리밍 요청 실패 (status ${response.status})`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = buffer.indexOf("\n\n");

      while (separatorIndex !== -1) {
        const frame = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);

        let eventName = "message";
        let dataText = "";

        frame.split("\n").forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice("event:".length).trim();
          } else if (line.startsWith("data:")) {
            dataText += line.slice("data:".length).trim();
          }
        });

        if (dataText) {
          try {
            const parsed = JSON.parse(dataText);

            if (eventName === "delta") {
              onDelta?.(parsed.text || "");
            } else if (eventName === "done") {
              onDone?.(parsed);
            } else if (eventName === "error") {
              onError?.(parsed.message || "AI 스트리밍 처리 중 오류가 발생했습니다.");
            }
          } catch {
            // 조각난 프레임 파싱 실패는 무시하고 다음 프레임을 계속 읽는다.
          }
        }

        separatorIndex = buffer.indexOf("\n\n");
      }
    }
  } catch (error) {
    onError?.(error?.message || "AI 스트리밍 요청 실패.");
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

export const createSettingOptions = (state, extra, options) =>
  generateAiContent("CREATE_SETTING_OPTIONS", state, extra, options);

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
  requestAiGenerateStream,
  generateAiContent,
  extractGeneratedText,
  extractGeneratedPages,
  extractGeneratedScenes,
  normalizeSetting,
  createSettingOptions,
  createPagePlan,
  writePage,
  createScenePlan,
  writeScene,
  createImagePrompt,
  createCoverPrompt,
  makeAiGenerateRequest,
};
