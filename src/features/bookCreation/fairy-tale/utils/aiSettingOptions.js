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

// CHAT/FREE 전용: envelope 최상위 status/missingFields, taskResult.setting을 꺼낸다.
export const getStatus = (data) => getEnvelope(data)?.status || "";

export const getMissingFields = (data) => {
  const fields = getEnvelope(data)?.missingFields;
  return Array.isArray(fields) ? fields : [];
};

export const getResultSetting = (data) => {
  const taskResult = getTaskResult(data);
  return taskResult?.setting && typeof taskResult.setting === "object" ? taskResult.setting : null;
};

export const getResultExamples = (data) => {
  const taskResult = getTaskResult(data);
  const examples = taskResult?.examples;
  return Array.isArray(examples)
    ? examples.filter((example) => typeof example === "string" && example.trim())
    : [];
};

// CHAT/FREE의 대화형 응답(선택지 없이 message/question만 있는 COLLECT_SETTING류) 유효성 검사.
export const isValidChatResponse = (data) => {
  if (getStatus(data) === "FAILED") return false;
  return Boolean(getChoiceQuestion(data));
};

// 채팅형 페이지 글쓰기(WRITE_PAGE/REWRITE_PAGE) 전용 게터.
// 두 task의 실제 응답 필드명(bodyText/revisedBodyText)이 범용 extractGeneratedText의
// 후보 목록에 없어서 정확히 읽지 못했던 문제를 해결하기 위해 별도로 둔다.
export const getPageBody = (data) => {
  const taskResult = getTaskResult(data);
  return taskResult?.bodyText || taskResult?.revisedBodyText || "";
};

// bodyTextEn/revisedBodyTextEn — bodyText/revisedBodyText의 영어 번역. getPageBody와 동일한 패턴.
export const getPageBodyEn = (data) => {
  const taskResult = getTaskResult(data);
  return taskResult?.bodyTextEn || taskResult?.revisedBodyTextEn || "";
};

// TRANSLATE_TEXT 응답에서 번역된 영어 문장을 꺼낸다(직접 입력 답변 번역용).
export const getTranslatedText = (data) => getTaskResult(data)?.textEn || "";

export const getNextQuestion = (data) => getTaskResult(data)?.nextQuestion || "";

export const getEditSummary = (data) => getTaskResult(data)?.editSummary || "";

export const isValidPageBody = (data) => {
  if (getStatus(data) === "FAILED") return false;
  return Boolean(getPageBody(data).trim());
};

// 공동창작실 전용: CREATE_PAGE_PLAN 응답에서 페이지 배열을 꺼낸다.
// Python 스키마는 result.pages지만, 방어적으로 pagePlan/storyPages 별칭도 확인한다.
export const getPagePlan = (data) => {
  const taskResult = getTaskResult(data);
  const pages = taskResult?.pages || taskResult?.pagePlan || taskResult?.storyPages || [];
  return Array.isArray(pages) ? pages : [];
};

export const isValidPagePlan = (data, expectedPageCount) => {
  const pages = getPagePlan(data);

  if (pages.length === 0) return false;
  if (expectedPageCount && pages.length !== expectedPageCount) return false;

  return pages.every((page) => page && typeof page.pageNo === "number");
};

// 스트리밍 delta는 response_mime_type=application/json이라 조각난 JSON 텍스트다.
// 완전한 JSON 파서 대신, 지정한 필드 값이 인식되는 시점에만 로딩 프리뷰를 갱신하기 위한
// 가벼운 정규식 추출기. 정답 소스가 아니라 로딩 중 보여줄 힌트 텍스트 용도로만 쓴다.
export const extractPartialField = (buffer, fieldName) => {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`);
  const match = regex.exec(buffer);
  if (!match) return null;

  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
};

export const extractPartialQuestion = (buffer) => extractPartialField(buffer, "question");
