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

// 문단들을 페이지 분량 그룹으로 묶는다. 각 그룹에 원래 문단이 몇 개 들어갔는지(paragraphCount)도
// 같이 반환하는데, 이건 contentTextEn을 같은 문단 개수만큼 슬라이스해서 정렬하기 위해서다.
// aligned:false는 문단 하나가 너무 길어서 문장 단위로 재분할된 조각이라, 원문 문단과
// 1:1 대응이 안 되는 경우다(이 경우 해당 그룹은 영어 정렬에서 제외한다).
function chunkParagraphs(paragraphs) {
  const groups = [];
  let current = [];
  let currentLength = 0;

  const flushCurrent = () => {
    if (current.length) {
      groups.push({ text: current.join("\n\n"), paragraphCount: current.length, aligned: true });
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
          groups.push({ text: sentenceChunk.join(" "), paragraphCount: 1, aligned: false });
          sentenceChunk = [];
          sentenceLength = 0;
        }
        sentenceChunk.push(sentence);
        sentenceLength += sentence.length;
      });

      if (sentenceChunk.length) {
        groups.push({ text: sentenceChunk.join(" "), paragraphCount: 1, aligned: false });
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
  return groups.length ? groups : [{ text: "", paragraphCount: 0, aligned: true }];
}

// scenes(장면) 배열을 발행 API(BookPublishRequestDto.PageRequest)가 받는 pages[] 형식으로
// 변환한다. 장면 하나의 본문이 리더 한 페이지보다 길면 여러 행으로 쪼개고, pageNo는
// 책 전체를 통틀어 순서대로 이어붙인다(장면별로 다시 1부터 시작하지 않는다).
//
// contentTextEn은 한글과 글자 수가 달라서 같은 예산으로 독립적으로 자르면 페이지가 안 맞을
// 수 있다. 대신 한글 문단 그룹의 "문단 개수"를 그대로 영어 문단에도 적용해서 순서를 맞춘다.
// 번역문 문단 수가 원문과 다르거나(오래된 번역, AI 응답 형태 차이 등) 문단 하나가 너무 길어서
// 문장 단위로 쪼개진 그룹(aligned:false)이 있으면, 그 장면은 안전하게 contentTextEn을 비워둔다.
export function splitScenesIntoPageRequests(scenes) {
  const pages = [];
  let pageNo = 1;

  scenes.forEach((scene) => {
    const koParagraphs = splitIntoParagraphs(scene.content || "");
    const groups = chunkParagraphs(koParagraphs);

    const enParagraphs = splitIntoParagraphs(scene.contentEn || "");
    const canAlignEnglish =
      enParagraphs.length > 0 &&
      enParagraphs.length === koParagraphs.length &&
      groups.every((group) => group.aligned);

    let enCursor = 0;

    groups.forEach((group, index) => {
      let contentTextEn = "";

      if (canAlignEnglish) {
        contentTextEn = enParagraphs.slice(enCursor, enCursor + group.paragraphCount).join("\n\n");
        enCursor += group.paragraphCount;
      }

      pages.push({
        pageNo: pageNo++,
        title: index === 0 ? scene.title || null : null,
        contentType: "CHAPTER",
        contentTextKo: group.text,
        contentTextEn,
        imageUrl: index === 0 ? scene.imageUrl || null : null,
      });
    });
  });

  return pages;
}
