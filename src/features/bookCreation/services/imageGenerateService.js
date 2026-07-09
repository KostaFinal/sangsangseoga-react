const AI_GENERATE_IMAGE_URL = "http://localhost:8080/api/ai/generate-image";

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
      },
      body: JSON.stringify({ promptText, imageType, pageNo, style, aspectRatio }),
      signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
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
// 실제 이미지 URL을 꺼낸다.
export const extractImageUrl = (fetchData) => fetchData?.data?.imageUrl || null;

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
