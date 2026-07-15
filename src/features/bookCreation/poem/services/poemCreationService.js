import { requestAiGenerate } from "../../services/aiGenerateService";
import { getTaskResult, isSuccessResponse } from "../../utils/aiResponseEnvelope";
import { getContentBase } from "../utils/poemTextUtils";

const AGE_TO_READER_AGE = {
  미취학아동: "PRESCHOOL",
  "초등학교 저학년": "LOWER_ELEMENTARY",
  "초등학교 고학년": "UPPER_ELEMENTARY",
  "중·고등학생": "TEEN",
  성인: "ADULT",
};

export const toReaderAge = (authorAge) => AGE_TO_READER_AGE[authorAge] || "ADULT";

const buildPoemDraft = (settings = {}, poem = {}) => ({
  bookType: "POEM",
  meta: {
    readerAge: toReaderAge(settings.authorAge),
  },
  setting: {
    mode: settings.mode === "free" ? "FREE" : "ANSWER",
    topic: settings.topic || "",
    style: settings.style || "",
    length: settings.length || "",
    mood: settings.mood || "",
    title: poem.title || "",
    answers: poem.answers || {},
    freeRequest: poem.freeRequest || "",
    existingContent: getContentBase(poem.content),
  },
});

// 답변형 전체 생성, 자유형 첫 생성/이어쓰기 공용 — isContinuation은 자유형에서 기존 본문 뒤에 이어 쓸 때만 true.
export async function generatePoem({ settings, poem, isContinuation = false } = {}) {
  const draft = buildPoemDraft(settings, poem);

  const response = await requestAiGenerate({
    taskType: "WRITE_POEM",
    draft,
    extra: { isContinuation },
  });

  if (!response.ok || !isSuccessResponse(response.data)) {
    return { ok: false, message: response.message };
  }

  const taskResult = getTaskResult(response.data);

  return {
    ok: true,
    title: typeof taskResult.title === "string" ? taskResult.title : "",
    content: typeof taskResult.content === "string" ? taskResult.content : "",
    titleIdeas: Array.isArray(taskResult.titleIdeas) ? taskResult.titleIdeas : [],
  };
}

// 답변형/자유형 공용 — 선택된 부분(selectedText)만 editRequest 방향으로 다시 쓴다.
export async function rewritePoemSelection({ settings, poem, selectedText, editRequest } = {}) {
  const draft = buildPoemDraft(settings, poem);

  const response = await requestAiGenerate({
    taskType: "REWRITE_POEM",
    draft,
    extra: { selectedText, editRequest },
  });

  if (!response.ok || !isSuccessResponse(response.data)) {
    return { ok: false, message: response.message };
  }

  const taskResult = getTaskResult(response.data);

  return {
    ok: true,
    revisedText: typeof taskResult.revisedText === "string" ? taskResult.revisedText : "",
  };
}
