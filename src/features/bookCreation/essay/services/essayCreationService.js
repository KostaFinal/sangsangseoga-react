import { requestAiGenerate } from "../../services/aiGenerateService";
import { getTaskResult, isSuccessResponse } from "../../utils/aiResponseEnvelope";
import { clean } from "../utils/essayTextUtils";
import { TEXT_ONLY_BODY_BOX, TEXT_ONLY_TEXT_STYLE } from "../../../library/utils/mapBookPages.js";
import { splitTextToFitBox } from "../../../library/utils/textFitting.js";

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 번역된 영어가 이 페이지의 리더 본문 박스(한국어 기준으로 잘라 둔 그 박스)에 실제로
// 들어가는지 확인한다. 영어는 같은 뜻이라도 한국어보다 길어질 때가 많아서, 번역이
// 끝났다고 그냥 믿으면 리더에서 글이 잘려 보일 수 있다.
function fitsEssayBox(textEn, fontSize = TEXT_ONLY_TEXT_STYLE.fontSize) {
  const fragments = splitTextToFitBox(textEn, { ...TEXT_ONLY_BODY_BOX, ...TEXT_ONLY_TEXT_STYLE, fontSize });
  return fragments.length <= 1;
}

// 재시도로 다듬어도 기본 글자 크기(17px) 박스에 안 들어가는 번역은, 잘라내는 대신 글자
// 크기를 한 단계씩 줄여서 박스 안에 확실히 들어가는 크기를 찾는다. 맨 끝(11px)까지도 안
// 맞으면 — 사실상 없는 경우지만 — 그래도 그 크기를 그대로 쓴다(저장이 막히는 것보다는 낫다).
const ESSAY_FONT_SIZE_STEPS = [17, 16, 15, 14, 13, 12, 11];

function fitEssayFontSize(textEn) {
  for (const fontSize of ESSAY_FONT_SIZE_STEPS) {
    if (fitsEssayBox(textEn, fontSize)) return fontSize;
  }
  return ESSAY_FONT_SIZE_STEPS[ESSAY_FONT_SIZE_STEPS.length - 1];
}

// 책 발행 시 각 페이지 본문(content_text_ko)의 영어 번역(content_text_en)을 채우는 데 쓴다.
// 반환값은 { text, fontSize } — fontSize는 이 번역이 기본 크기(17px) 박스에 안 들어가서
// 줄여야 했던 경우에만 17이 아닌 값이 된다(리더가 이 페이지의 영어만 그 크기로 그린다).
// 몇 번 재시도해서(넘칠 때는 더 간결하게 다시 번역해 달라고 요청) 기본 크기로 맞으면
// 그대로 쓰고, 끝까지 안 맞으면 글자 크기를 줄여서라도 반드시 결과를 돌려준다 — 번역
// 자체가 아예 실패한 경우에만 예외를 던진다(호출부가 이를 처리한다).
export async function translateEssayContent(textKo) {
  const text = String(textKo || "").trim();
  if (!text) return { text: "", fontSize: TEXT_ONLY_TEXT_STYLE.fontSize };

  const MAX_ATTEMPTS = 3;
  let lastMessage = "";
  let tooLong = false;
  let bestAttempt = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await requestAiGenerate({
        taskType: "TRANSLATE_ESSAY",
        draft: {},
        extra: { textKo: text, tooLong },
      });

      if (response.ok && isSuccessResponse(response.data)) {
        const taskResult = getTaskResult(response.data);
        const textEn = typeof taskResult.textEn === "string" ? taskResult.textEn.trim() : "";

        if (textEn) {
          bestAttempt = textEn;
          if (fitsEssayBox(textEn)) {
            return { text: textEn, fontSize: TEXT_ONLY_TEXT_STYLE.fontSize };
          }
          tooLong = true;
          lastMessage = "번역이 페이지 박스보다 길어서 잘려 보일 수 있어요.";
          if (attempt < MAX_ATTEMPTS) await wait(500);
          continue;
        }
      }
      lastMessage = response.message || "";
    } catch (error) {
      lastMessage = error?.message || "";
    }

    if (attempt < MAX_ATTEMPTS) {
      await wait(1000 * attempt);
    }
  }

  if (bestAttempt) {
    return { text: bestAttempt, fontSize: fitEssayFontSize(bestAttempt) };
  }

  throw new Error(`에세이 번역에 실패했어요.${lastMessage ? ` (${lastMessage})` : ""}`);
}

// 책 발행 시 제목(title)의 영어 번역(titleEn)을 채우는 데 쓴다. 제목은 본문과 달리 페이지
// 박스에 맞춰 잘릴 일이 없어 fitsEssayBox 재시도 루프가 필요 없다. 실패해도 발행 자체를
// 막을 정도는 아니라서(제목 없이도 책은 읽을 수 있다) 예외를 던지지 않고 빈 문자열로 넘어간다.
export async function translateEssayTitle(titleKo) {
  const text = String(titleKo || "").trim();
  if (!text) return "";

  try {
    const response = await requestAiGenerate({
      taskType: "TRANSLATE_ESSAY",
      draft: {},
      extra: { textKo: text },
    });

    if (!response.ok || !isSuccessResponse(response.data)) return "";

    const taskResult = getTaskResult(response.data);
    return typeof taskResult.textEn === "string" ? taskResult.textEn.trim() : "";
  } catch {
    return "";
  }
}
