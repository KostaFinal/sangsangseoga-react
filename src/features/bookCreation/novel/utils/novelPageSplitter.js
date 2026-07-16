import {
  translateText,
  extractGeneratedTextEn,
  extractGeneratedTitleEn,
} from "../../services/aiGenerateService";

// 리더 화면(src/features/library/components/reader/layout/LayoutPageViewer.jsx)의
// 텍스트 박스 크기/글꼴 상수를 그대로 따른다. mapBookPages.js의 textOnlyPage()가 만드는
// 텍스트 박스는 w:360, h:500, fontSize:17, lineHeight:1.85 고정이고, 글자 크기 토글
// (FONT_SCALE: sm 0.85 / base 1 / lg 1.2)에 따라 폰트 크기만 커진다.
// 발행 시점에 가장 큰 글씨(lg, 1.2배) 기준으로 분량을 계산해서 잘라두면, 그보다 작은
// base/sm에서는 항상 여유 공간만 남고 절대 넘치지 않는다.
const BOX_WIDTH = 360;
const BOX_HEIGHT = 500;
const BASE_FONT_SIZE = 17;
const LINE_HEIGHT_RATIO = 1.85;
const LARGEST_FONT_SCALE = 1.2;

const SCALED_FONT_SIZE = BASE_FONT_SIZE * LARGEST_FONT_SCALE;
const SCALED_LINE_HEIGHT = SCALED_FONT_SIZE * LINE_HEIGHT_RATIO;

const LINES_PER_PAGE = Math.floor(BOX_HEIGHT / SCALED_LINE_HEIGHT);
const CHARS_PER_LINE = Math.floor(BOX_WIDTH / SCALED_FONT_SIZE);

// 문단 사이 여백, 폰트 렌더링 오차를 감안한 안전 마진.
const SAFETY_MARGIN = 0.85;
const CHARS_PER_PAGE = Math.floor(LINES_PER_PAGE * CHARS_PER_LINE * SAFETY_MARGIN);

function splitIntoParagraphs(text) {
  if (!text) return [];
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

// 문단 하나가 그 자체로 한 페이지 분량을 넘으면 문장 단위로 다시 쪼갠다.
function splitIntoSentences(paragraph) {
  const sentences = paragraph.match(/[^.!?]+[.!?]*/g) || [paragraph];
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

// 문단들을 페이지 분량 그룹으로 묶는다. 한글 원문만 기준으로 자르고, 영어 번역은
// (예전처럼 이미 번역된 전체 문자열을 문단 수로 맞춰 슬라이스하는 대신) 이 함수가 반환한
// 그룹별로 나중에 translateChunks()가 그룹 텍스트 자체를 번역 요청해서 채운다.
// 그래서 그룹 개수·문단 정렬이 한글/영어 사이에 어긋날 일이 애초에 없다.
function chunkParagraphs(paragraphs) {
  const groups = [];
  let current = [];
  let currentLength = 0;

  const flushCurrent = () => {
    if (current.length) {
      groups.push({ text: current.join("\n\n") });
      current = [];
      currentLength = 0;
    }
  };

  paragraphs.forEach((paragraph) => {
    if (paragraph.length > CHARS_PER_PAGE) {
      flushCurrent();

      let sentenceChunk = [];
      let sentenceLength = 0;

      splitIntoSentences(paragraph).forEach((sentence) => {
        if (sentenceLength + sentence.length > CHARS_PER_PAGE && sentenceChunk.length) {
          groups.push({ text: sentenceChunk.join(" ") });
          sentenceChunk = [];
          sentenceLength = 0;
        }
        sentenceChunk.push(sentence);
        sentenceLength += sentence.length;
      });

      if (sentenceChunk.length) {
        groups.push({ text: sentenceChunk.join(" ") });
      }
      return;
    }

    if (currentLength + paragraph.length > CHARS_PER_PAGE && current.length) {
      flushCurrent();
    }

    current.push(paragraph);
    currentLength += paragraph.length;
  });

  flushCurrent();
  return groups.length ? groups : [{ text: "" }];
}

// 그룹(한글 조각) 하나를 TRANSLATE_TEXT로 번역한다. titleKo를 같이 넘기면(장면의 첫 조각에서만)
// titleEn도 같이 받아온다. 실패해도 예외를 던지지 않고 빈 문자열로 폴백하되, 어떤 장면/몇 번째
// 페이지에서 실패했는지는 반드시 콘솔에 남긴다 — 조용히 넘어가면 나중에 원인을 찾을 수 없다.
async function translateChunk(text, { protagonistName, titleKo } = {}, logCtx = {}) {
  const trimmedText = (text || "").trim();
  const trimmedTitle = (titleKo || "").trim();

  if (!trimmedText && !trimmedTitle) {
    return { textEn: "", titleEn: "" };
  }

  try {
    const response = await translateText(trimmedText, {
      protagonistName,
      ...(trimmedTitle ? { titleKo: trimmedTitle } : {}),
    });

    if (!response.ok) {
      console.error(
        `[novel publish] 번역 실패 - sceneId=${logCtx.sceneId}, pageNo=${logCtx.pageNo}: ${response.message}`
      );
      return { textEn: "", titleEn: "" };
    }

    return {
      textEn: extractGeneratedTextEn(response.data),
      titleEn: trimmedTitle ? extractGeneratedTitleEn(response.data) : "",
    };
  } catch (error) {
    console.error(
      `[novel publish] 번역 중 예외 발생 - sceneId=${logCtx.sceneId}, pageNo=${logCtx.pageNo}:`,
      error
    );
    return { textEn: "", titleEn: "" };
  }
}

// scenes(장면) 배열을 발행 API(BookPublishRequestDto.PageRequest)가 받는 pages[] 형식으로
// 변환한다. 장면 하나의 본문이 리더 한 페이지보다 길면 여러 행으로 쪼개고, pageNo는
// 책 전체를 통틀어 순서대로 이어붙인다(장면별로 다시 1부터 시작하지 않는다).
//
// 영어 번역은 "한글을 먼저 자르고, 잘린 조각마다 번역을 요청"하는 방식으로 채운다.
// 장면 전체를 한 번에 번역한 뒤 문단 개수를 맞춰 슬라이스하던 예전 방식은, LLM 번역문의
// 문단 수가 원문과 정확히 같으리라는 보장이 없어서 조금만 어긋나도 그 장면 전체의 영어가
// 통째로 비어버렸다. 조각 단위로 번역하면 애초에 정렬이 필요 없어 이 문제가 구조적으로 없어진다.
//
// 편집 화면에서 이미 번역해둔 scene.contentEn/scene.titleEn은, 장면이 페이지 하나에 다
// 들어가서(가장 흔한 경우) 조각이 장면 전체와 정확히 같을 때만 캐시로 재사용한다 — 중복
// API 호출을 줄이기 위한 최적화일 뿐, 최종 번역 완성도는 이 함수의 조각 단위 재번역이 보장한다.
export async function splitScenesIntoPageRequests(scenes, { protagonistName = "" } = {}) {
  const pages = [];
  let pageNo = 1;

  for (const scene of scenes) {
    const koParagraphs = splitIntoParagraphs(scene.content || "");
    const groups = chunkParagraphs(koParagraphs);
    const isSinglePageScene = groups.length === 1;

    for (let index = 0; index < groups.length; index++) {
      const group = groups[index];
      const isFirst = index === 0;
      const currentPageNo = pageNo++;

      let contentTextEn = "";
      let titleEn = "";

      const canReuseContentCache =
        isSinglePageScene && scene.contentEn && scene.contentEnSyncedWith === scene.content;
      const canReuseTitleCache =
        isFirst && scene.titleEn && scene.titleEnSyncedWith === scene.title;

      if (canReuseContentCache) {
        contentTextEn = scene.contentEn;
      }
      if (canReuseTitleCache) {
        titleEn = scene.titleEn;
      }

      const needsContentTranslation = !canReuseContentCache && group.text.trim();
      const needsTitleTranslation = isFirst && !canReuseTitleCache && (scene.title || "").trim();

      if (needsContentTranslation || needsTitleTranslation) {
        const translated = await translateChunk(
          needsContentTranslation ? group.text : "",
          {
            protagonistName,
            titleKo: needsTitleTranslation ? scene.title : "",
          },
          { sceneId: scene.id, pageNo: currentPageNo }
        );

        if (needsContentTranslation) contentTextEn = translated.textEn;
        if (needsTitleTranslation) titleEn = translated.titleEn;
      }

      pages.push({
        pageNo: currentPageNo,
        title: isFirst ? scene.title || null : null,
        titleEn: isFirst ? titleEn || null : null,
        contentType: "CHAPTER",
        contentTextKo: group.text,
        contentTextEn,
        imageUrl: isFirst ? scene.imageUrl || null : null,
      });
    }
  }

  return pages;
}
