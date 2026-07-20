import { getAccessToken } from "../../../api/tokenStorage";
import { API_BASE_URL } from "../../../api/axios";
import { reportAiErrorResponse } from "./quotaErrorBus";

const AI_GENERATE_IMAGE_URL = `${API_BASE_URL}/api/ai/generate-image`;

// fetch()는 axiosInstance와 달리 인터셉터가 없어 Authorization 헤더를 직접 붙여야 한다.
// 이게 빠져있으면 로그인 여부와 무관하게 서버가 항상 401(UNAUTHORIZED)을 반환한다.
const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

export const requestGenerateImage = async ({
  promptText,
  imageType,
  pageNo = null,
  style = null,
  aspectRatio = "3:4",
  bookType = null,
  // 캐릭터 일관성용 레퍼런스 이미지(보통 이미 생성된 표지)의 로컬 URL. Spring이 이 URL로 파일을
  // 읽어 Python에 base64로 전달한다.
  referenceImageUrl = null,
  signal,
} = {}) => {
  if (!promptText) {
    return {
      ok: false,
      status: 0,
      message: "promptText is required.",
      data: null,
    };
  }

  try {
    const response = await fetch(AI_GENERATE_IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ promptText, imageType, pageNo, style, aspectRatio, bookType, referenceImageUrl }),
      signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      reportAiErrorResponse(response.status, data);

      return {
        ok: false,
        status: response.status,
        message: extractMessage(data, response.statusText || "이미지 생성 요청 실패"),
        data,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: extractMessage(data, "OK"),
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error?.message || "이미지 생성 요청 실패",
      data: null,
      error,
    };
  }
};

// Spring의 ApiResponse { success, data: { success, message, imageUrl, imageBase64 }, code, message } 구조에서
// 실제 이미지 URL을 꺼낸다. Gemini 이미지 생성은 호스팅 URL이 없어 imageUrl이 비어 있고, 대신
// imageBase64에 <img src>에 바로 쓸 수 있는 data URI("data:image/png;base64,...")가 담겨 온다.
export const extractImageUrl = (fetchData) => fetchData?.data?.imageUrl || fetchData?.data?.imageBase64 || null;

// Spring의 ApiResponse { success, data: { bookId, stage, result: <Python envelope> }, code, message } 구조에서
// CREATE_IMAGE_PROMPT/CREATE_COVER_PROMPT 응답(Python envelope)을 꺼낸다.
// Python envelope 자체는 { status, taskType, message, result: { coverPrompt, pagePrompts, ... }, ... } 형태다.
const extractAiEnvelope = (fetchData) => fetchData?.data?.result || null;

export const extractAiStatus = (fetchData) => extractAiEnvelope(fetchData)?.status || null;

export const extractAiMessage = (fetchData) => extractAiEnvelope(fetchData)?.message || null;

export const extractCoverPrompt = (fetchData) =>
  extractAiEnvelope(fetchData)?.result?.coverPrompt || "";

export const extractPagePrompts = (fetchData) => {
  const envelope = extractAiEnvelope(fetchData);
  return Array.isArray(envelope?.result?.pagePrompts) ? envelope.result.pagePrompts : [];
};

export const imageGenerateService = {
  requestGenerateImage,
  extractImageUrl,
  extractAiStatus,
  extractAiMessage,
  extractCoverPrompt,
  extractPagePrompts,
};
