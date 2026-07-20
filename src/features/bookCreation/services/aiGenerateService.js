import { toAiGenerateRequest, toBookDraft } from "../utils/bookDraftMapper";
import { getTaskResult } from "../fairy-tale/utils/aiSettingOptions";
import { getAccessToken } from "../../../api/tokenStorage";
import { API_BASE_URL } from "../../../api/axios";
import { reportAiErrorResponse } from "./quotaErrorBus";

// fetch()는 axiosInstance와 달리 인터셉터가 없어 Authorization 헤더를 직접 붙여야 한다.
// 이게 빠져있으면 로그인 여부와 무관하게 서버가 항상 401(UNAUTHORIZED)을 반환한다.
const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AI_GENERATE_URL = `${API_BASE_URL}/api/ai/generate`;
const AI_GENERATE_STREAM_URL = `${API_BASE_URL}/api/ai/generate/stream`;

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

// Spring 응답은 { success, data: { bookId, stage, result: <Python envelope> } } 형태이고,
// Python envelope 자체의 result가 taskType별 실제 결과(scenes/pages/bodyText 등)를 담고 있다.
// getTaskResult가 이 이중 래핑을 전부 풀어서 taskType별 result 객체에 바로 닿게 해준다.
// (예전엔 한 겹만 풀어서 scenes/pages/bodyText를 못 읽고 항상 fallback 텍스트로 빠졌었다.)
export const extractGeneratedText = (data) => {
  const result = getTaskResult(data);

  if (!result || typeof result === "string") return result || "";

  const generated =
    result.bodyText ||
    result.revisedBodyText ||
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

// extractGeneratedText(한글)의 영어 버전. WRITE_SCENE의 bodyTextEn, REWRITE_SCENE의
// revisedBodyTextEn, TRANSLATE_TEXT의 textEn을 모두 같은 함수로 커버한다.
export const extractGeneratedTextEn = (data) => {
  const result = getTaskResult(data);

  if (!result || typeof result === "string") return "";

  const generated = result.bodyTextEn || result.revisedBodyTextEn || result.textEn || "";

  return typeof generated === "string" ? generated : "";
};

// TRANSLATE_TEXT가 extra.titleKo와 함께 요청됐을 때 돌려주는 titleEn을 읽는다.
// titleKo를 안 보낸 요청이면 Python이 titleEn을 빈 문자열로 채워서 그대로 ""가 나온다.
export const extractGeneratedTitleEn = (data) => {
  const result = getTaskResult(data);

  if (!result || typeof result === "string") return "";

  return typeof result.titleEn === "string" ? result.titleEn : "";
};

export const extractGeneratedPages = (data) => {
  const result = getTaskResult(data);
  return Array.isArray(result?.pages) ? result.pages : [];
};

export const extractGeneratedScenes = (data) => {
  const result = getTaskResult(data);
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
        ...authHeaders(),
      },
      body: JSON.stringify(requestBody),
      signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      reportAiErrorResponse(response.status, data);

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
        ...authHeaders(),
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok || !response.body) {
      const data = await parseResponseBody(response);
      reportAiErrorResponse(response.status, data);
      onError?.(extractMessage(data, `AI 스트리밍 요청 실패 (status ${response.status})`));
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

export const collectSetting = (state, extra, options) =>
  generateAiContent("COLLECT_SETTING", state, extra, options);

export const createSettingOptions = (state, extra, options) =>
  generateAiContent("CREATE_SETTING_OPTIONS", state, extra, options);

// 소설 선택형(CHOICE) 모드 첫 화면: 완성된 시나리오 카드 여러 개를 한 번에 생성한다.
export const createScenarioCards = (state, extra, options) =>
  generateAiContent("CREATE_SCENARIO_CARDS", state, extra, options);

// 표지 선택 화면의 "추천 표지 시안" 카드 여러 개(이름+한 줄 설명)를 이야기에 맞게 생성한다.
export const createCoverConcepts = (state, extra, options) =>
  generateAiContent("CREATE_COVER_CONCEPTS", state, extra, options);

export const createPagePlan = (state, extra, options) =>
  generateAiContent("CREATE_PAGE_PLAN", state, extra, options);

export const writePage = (state, extra, options) =>
  generateAiContent("WRITE_PAGE", state, extra, options);

export const rewritePage = (state, extra, options) =>
  generateAiContent("REWRITE_PAGE", state, extra, options);

export const createScenePlan = (state, extra, options) =>
  generateAiContent("CREATE_SCENE_PLAN", state, extra, options);

export const writeScene = (state, extra, options) =>
  generateAiContent("WRITE_SCENE", state, extra, options);

export const rewriteScene = (state, extra, options) =>
  generateAiContent("REWRITE_SCENE", state, extra, options);

// 청소년/성인(창작 보조 모드) 전용: 장면 전체가 아니라 문장/문단/선택 영역 단위로만 짧게 보조한다.
export const writeSceneSegment = (state, extra, options) =>
  generateAiContent("WRITE_SCENE_SEGMENT", state, extra, options);

export const createImagePrompt = (state, extra, options) =>
  generateAiContent("CREATE_IMAGE_PROMPT", state, extra, options);

export const createCoverPrompt = (state, extra, options) =>
  generateAiContent("CREATE_COVER_PROMPT", state, extra, options);

// 사용자가 AI 옵션 대신 직접 입력한 문장을 영어로 번역한다. book/설정 draft가 필요 없는
// 단발성 호출이라 toBookDraft(state) 없이 빈 draft로 호출한다.
// protagonistName/otherProperNouns를 같이 보내면, 주인공 이름과 철자가 같은 일반 명사(예: "나비"=이름/butterfly)를
// 실수로 번역하지 않고 이름 그대로 로마자 표기하도록 translate_text.txt가 참고한다.
export const translateText = (textKo, context = {}, options) =>
  requestAiGenerate({
    taskType: "TRANSLATE_TEXT",
    draft: {},
    extra: { textKo, ...context },
    ...options,
  });

export const makeAiGenerateRequest = toAiGenerateRequest;

export const aiGenerateService = {
  requestAiGenerate,
  requestAiGenerateStream,
  generateAiContent,
  extractGeneratedText,
  extractGeneratedTextEn,
  extractGeneratedTitleEn,
  extractGeneratedPages,
  extractGeneratedScenes,
  normalizeSetting,
  collectSetting,
  createSettingOptions,
  createScenarioCards,
  createCoverConcepts,
  createPagePlan,
  writePage,
  rewritePage,
  createScenePlan,
  writeScene,
  rewriteScene,
  writeSceneSegment,
  createImagePrompt,
  createCoverPrompt,
  translateText,
  makeAiGenerateRequest,
};
