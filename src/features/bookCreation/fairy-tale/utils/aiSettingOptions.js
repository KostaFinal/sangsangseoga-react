// CHOICE/MIXED 화면이 공유하는 AI 선택지 응답 파싱 + 검증 유틸.
//
// 실제 응답 중첩 구조:
//   Spring ApiResponse 래핑: { success, data: { bookId, stage, result: <PythonEnvelope> }, code, message }
//   원본(Postman 등)       : <PythonEnvelope>
//   PythonEnvelope         : { status, taskType, message, result: { stepKey, question, guide, options }, ... }
//
// getEnvelope은 래핑 유무와 관계없이 PythonEnvelope에 닿고, getTaskResult는 envelope.result(작업별 payload)에 닿는다.

export const getEnvelope = (data) => data?.data?.result ?? data?.result ?? data;

export const getTaskResult = (data) => {
  const envelope = getEnvelope(data);
  return envelope?.result && typeof envelope.result === "object" ? envelope.result : envelope;
};

export const getChoiceQuestion = (data) => {
  const taskResult = getTaskResult(data);
  const envelope = getEnvelope(data);

  return (
    taskResult?.question ||
    taskResult?.nextQuestion ||
    envelope?.message ||
    data?.data?.message ||
    data?.message ||
    ""
  );
};

export const getChoiceGuide = (data) => {
  const taskResult = getTaskResult(data);
  return taskResult?.guide || "";
};

export const getChoiceOptions = (data) => {
  const taskResult = getTaskResult(data);
  const options =
    taskResult?.options ||
    taskResult?.selectedOptions ||
    taskResult?.choices ||
    taskResult?.recommendations ||
    [];

  if (Array.isArray(options)) return options;
  if (options && typeof options === "object") return Object.values(options);
  return [];
};

export const normalizeChoiceOptions = (options, stepKey) =>
  (Array.isArray(options) ? options : [])
    .map((option, index) => {
      const raw = option && typeof option === "object" ? option : { title: option };
      const title = raw.title || raw.label || raw.value || raw.text || "";

      if (!title) return null;

      const desc = raw.desc || raw.description || raw.reason || raw.summary || "";

      return {
        ...raw,
        id: raw.id || `${stepKey}_${index}`,
        title,
        desc,
        description: desc,
        icon: raw.icon || raw.emoji || "?",
      };
    })
    .filter(Boolean);

// 작업 5: fallback 판정 유틸. Spring 래핑 유무와 무관하게 동작한다.
export const isValidOptionsResponse = (data, stepKey) => {
  const question = getChoiceQuestion(data);
  const options = normalizeChoiceOptions(getChoiceOptions(data), stepKey);

  if (!question || options.length === 0) return false;

  return options.every((option) => {
    if (!(option.title || option.label) || option.value === undefined || option.value === null) {
      return false;
    }

    if (stepKey === "protagonist") {
      return (
        option.value &&
        typeof option.value === "object" &&
        typeof option.value.protagonistName === "string" &&
        option.value.protagonistName.trim() !== "" &&
        typeof option.value.protagonistDesc === "string" &&
        option.value.protagonistDesc.trim() !== ""
      );
    }

    return true;
  });
};

export const FALLBACK_NOTICE_TEXT = "AI 추천을 불러오지 못해 기본 선택지를 보여드려요.";

// 스트리밍 delta는 response_mime_type=application/json이라 조각난 JSON 텍스트다.
// 완전한 JSON 파서 대신, question 필드 값이 인식되는 시점에만 로딩 라벨을 갱신하기 위한
// 가벼운 정규식 추출기. 정답 소스가 아니라 로딩 중 보여줄 힌트 텍스트 용도로만 쓴다.
const PARTIAL_QUESTION_REGEX = /"question"\s*:\s*"((?:[^"\\]|\\.)*)/;

export const extractPartialQuestion = (buffer) => {
  const match = PARTIAL_QUESTION_REGEX.exec(buffer);
  if (!match) return null;

  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
};
