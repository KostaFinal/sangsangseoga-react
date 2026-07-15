import { requestAiGenerate } from "../../services/aiGenerateService";
import { getTaskResult, isSuccessResponse } from "../../utils/aiResponseEnvelope";
import { clean } from "../utils/essayTextUtils";

const AGE_TO_READER_AGE = {
  미취학아동: "PRESCHOOL",
  "초등학교 저학년": "LOWER_ELEMENTARY",
  "초등학교 고학년": "UPPER_ELEMENTARY",
  "중·고등학생": "TEEN",
  성인: "ADULT",
};

export const toReaderAge = (authorAge) => AGE_TO_READER_AGE[authorAge] || "ADULT";

const buildEssayDraft = ({ settings = {}, answers = {}, content = "", workInput = "" } = {}) => ({
  bookType: "ESSAY",
  meta: {
    readerAge: toReaderAge(settings.authorAge),
  },
  setting: {
    mode: settings.mode === "free" ? "FREE" : "GUIDED",
    theme: settings.theme || "",
    tone: settings.tone || "",
    title: settings.title || "",
    answers,
    workInput,
    existingContent: clean(content),
  },
});

// 가이드형 전체 생성, 자유형 첫 생성/이어쓰기 공용 — isContinuation은 자유형에서 기존 본문 뒤에 이어 쓸 때만 true.
export async function generateEssay({ settings, answers, content, workInput, isContinuation = false } = {}) {
  const draft = buildEssayDraft({ settings, answers, content, workInput });

  const response = await requestAiGenerate({
    taskType: "WRITE_ESSAY",
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
  };
}

// 가이드형/자유형 공용 — 선택된 부분(selectedText)만 editRequest 방향으로 다시 쓴다.
export async function rewriteEssaySelection({ settings, selectedText, editRequest } = {}) {
  const draft = buildEssayDraft({ settings });

  const response = await requestAiGenerate({
    taskType: "REWRITE_ESSAY",
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
