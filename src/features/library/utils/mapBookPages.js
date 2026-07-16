// 백엔드 BookPageDto 목록을 리더(LayoutPageViewer/FadePageViewer)가 기대하는
// { id, backgroundColor, elements } 형태로 변환한다.
// - FAIRY_TALE(동화): book_page가 이미지 행/글 행으로 이미 번갈아 저장돼 있다고 가정.
//   행에 imageUrl이 있으면 이미지만 있는 페이지, 없으면 글만 있는 페이지로 그대로 1:1 매핑.
// - POEM(시): 한 페이지 안에 제목+본문+삽화(있으면)가 같이 있다. PoemPreviewStep.jsx의
//   미리보기(제목→본문→삽화 순서, 삽화는 본문 아래 작은 썸네일)와 같은 순서/비중으로 배치한다.
// - 그 외 bookType(NOVEL/ESSAY/NONFICTION 등): 전부 글만 있는 페이지 (imageUrl은 사용 안 함)
//
// 여기 있는 박스 좌표/글꼴 값들은 책을 만들 때(textFitting.js로 본문을 페이지 단위로
// 미리 나눌 때)도 그대로 써야 리더에서 절대 넘치지 않는다는 보장이 깨지지 않는다.
// 박스 크기를 바꾸면 poemTextUtils.js/essayTextUtils.js의 같은 상수도 같이 바꿔야 한다.

const koText = (page) => page.contentTextKo || page.contentTextEn || "";
const enText = (page) => page.contentTextEn || page.contentTextKo || "";

// textOnlyPage(소설/에세이/지식정보)의 본문 박스. 제목이 있을 때(y:90)를 기준으로 삼는다
// (제목이 없을 때는 y:70이라 오히려 여유가 더 생기니 이 값으로 나눠도 항상 안전하다).
export const TEXT_ONLY_BODY_BOX = { x: 60, y: 90, w: 360, h: 500 };
export const TEXT_ONLY_TEXT_STYLE = { fontSize: 17, lineHeight: 1.85, fontFamily: "serif" };

export function textOnlyPage(page) {
  return {
    id: `page-${page.pageNo}`,
    backgroundColor: "#ffffff",
    elements: [
      ...(page.title ? [{
        id: `title-${page.pageNo}`,
        type: "text",
        x: 60, y: 50, w: 360, h: 30,
        fontSize: 15, fontWeight: 700, color: "#5139d6",
        htmlKo: page.title,
        htmlEn: page.titleEn || page.title,
      }] : []),
      {
        id: `text-${page.pageNo}`,
        type: "text",
        x: 60, y: page.title ? 90 : 70, w: 360, h: 500,
        fontSize: 17, lineHeight: 1.85, fontFamily: "serif",
        // 영어 번역이 기본 크기 박스에 안 들어가 발행 시 글자 크기를 줄여 저장한 페이지는
        // 영어로 볼 때만 이 크기를 쓴다(잘리는 대신 작게 보이게).
        fontSizeEn: page.contentFontSizeEn || undefined,
        htmlKo: koText(page),
        htmlEn: enText(page),
      },
    ],
  };
}

// 시가 여러 편일 때, 본문 없이 "OO편"만 가운데 크게 보여주는 구분 페이지.
// (본문이 비어있는데 제목만 있으면 구분 페이지로 간주 - poemPage() 참고)
function poemDividerPage(page) {
  // 480x620 캔버스 정중앙에 오도록 박스 자체를 가운데 배치(가로/세로 다 대칭)하고,
  // 안의 텍스트도 flex 가운데 정렬(LayoutPageViewer의 .layout-page-text)로 이중으로 맞춘다.
  const boxW = 400;
  const boxH = 140;
  return {
    id: `page-${page.pageNo}`,
    backgroundColor: "#ffffff",
    elements: [{
      id: `divider-${page.pageNo}`,
      type: "text",
      x: (480 - boxW) / 2, y: (620 - boxH) / 2, w: boxW, h: boxH,
      fontSize: 42, fontWeight: 800, color: "#5139d6",
      // 한 줄짜리 텍스트인데 기본 lineHeight(1.8)를 쓰면 줄 높이가 박스보다 훨씬 커져서
      // (42*1.8=75.6px) 시각적 무게중심이 아래로 쏠려 보인다. 1로 낮춰서 글자 자체 높이로만 맞춘다.
      lineHeight: 1,
      align: "center",
      verticalCenter: true,
      htmlKo: page.title,
      htmlEn: page.titleEn || page.title,
    }],
  };
}

// poemPage()의 제목+본문 박스(삽화 없는 경우 기준 - 삽화는 더 이상 새로 만들지 않는다).
export const POEM_CONTENT_BOX = { x: 60, y: 50, w: 360, h: 530 };
export const POEM_TEXT_STYLE = { fontSize: 17, lineHeight: 1.85, fontFamily: "serif" };

export function buildPoemTitleHtml(title) {
  return title
    ? `<div style="color:#5139d6;font-weight:700;font-size:0.88em;margin:0 0 2.4em;">${title}</div>`
    : '';
}

// 제목(있으면) + 본문 + 삽화(있으면, 본문 아래 작은 썸네일)를 한 페이지에 같이 배치한다.
// PoemPreviewStep.jsx가 제작 중 미리보기를 그릴 때도 이 함수를 그대로 재사용해서
// (export됨) 미리보기와 실제 리더가 항상 같은 레이아웃을 보여주게 한다.
export function poemPage(page) {
  // 본문 없이 제목만 있으면(예: "2편") 시가 바뀌는 지점의 구분 페이지다.
  if (!koText(page).trim() && page.title) {
    return poemDividerPage(page);
  }

  const hasImage = !!page.imageUrl;

  // 제목과 본문을 한 박스(하나의 elements 항목) 안에 같이 넣는다. 이 페이지의 본문은
  // poemTextUtils.js가 책을 만들 때 이미 이 박스에 딱 맞게(넘치지 않게) 잘라 둔 상태라
  // 여기서는 그대로 이어 붙이기만 하면 된다.
  const titleHtml = buildPoemTitleHtml(page.title);
  const titleHtmlEn = buildPoemTitleHtml(page.titleEn || page.title);

  const contentTop = POEM_CONTENT_BOX.y;
  const contentHeight = hasImage ? 300 : POEM_CONTENT_BOX.h;
  const imageGap = 20;
  const imageHeight = 130;
  // 리더에서 lg(1.2배) 글자 크기를 고르면 본문 박스 자체도 그만큼 커져서 화면에서 더 아래까지
  // 차지한다(본문 내용은 이미 박스 안에 맞게 잘려 있어도 박스 표시 영역은 커짐). 이미지는
  // 그 최대 크기 아래에서 시작해야 겹치지 않는다.
  const imageTop = contentTop + Math.round(contentHeight * 1.2) + imageGap;

  return {
    id: `page-${page.pageNo}`,
    backgroundColor: "#ffffff",
    elements: [
      {
        id: `content-${page.pageNo}`,
        type: "text",
        x: POEM_CONTENT_BOX.x, y: contentTop, w: POEM_CONTENT_BOX.w, h: contentHeight,
        fontSize: POEM_TEXT_STYLE.fontSize, lineHeight: POEM_TEXT_STYLE.lineHeight, fontFamily: POEM_TEXT_STYLE.fontFamily,
        // 영어 번역이 기본 크기 박스에 안 들어가 발행 시 글자 크기를 줄여 저장한 페이지는
        // 영어로 볼 때만 이 크기를 쓴다(잘리는 대신 작게 보이게 — 제목도 em 단위라 같이 작아짐).
        fontSizeEn: page.contentFontSizeEn || undefined,
        // 짧은 시는 페이지 가운데쯤에 오게 한다(본문은 이미 박스에 맞게 잘려 있어 넘칠 일이 없다).
        verticalCenter: "safe",
        htmlKo: titleHtml + koText(page),
        htmlEn: titleHtmlEn + enText(page),
      },
      ...(hasImage ? [{
        id: `image-${page.pageNo}`,
        type: "image",
        x: 60, y: imageTop, w: 360, h: imageHeight,
        radius: 14,
        objectFit: "cover",
        src: page.imageUrl,
      }] : []),
    ],
  };
}

// book_page 한 행이 이미지 행이면 이미지만, 글 행이면 글만 있는 페이지로 매핑 (1:1)
function fairyTalePage(page) {
  if (page.imageUrl) {
    return {
      id: `page-${page.pageNo}`,
      backgroundColor: "#fffaf0",
      elements: [{
        id: `image-${page.pageNo}`,
        type: "image",
        x: 0, y: 0, w: 480, h: 620,
        src: page.imageUrl,
      }],
    };
  }
  return {
    id: `page-${page.pageNo}`,
    backgroundColor: "#fffaf0",
    elements: [{
      id: `text-${page.pageNo}`,
      type: "text",
      x: 50, y: 120, w: 380, h: 380,
      fontSize: 19, lineHeight: 1.9, align: "center", fontWeight: 600,
      htmlKo: koText(page),
      htmlEn: enText(page),
    }],
  };
}

// bookType: "NOVEL" | "POEM" | "ESSAY" | "FAIRY_TALE" | "NONFICTION" | ...
export function mapBookPagesByGenre(bookType, pageItems = []) {
  if (bookType === "FAIRY_TALE") {
    return pageItems.map(fairyTalePage);
  }
  if (bookType === "POEM") {
    return pageItems.map(poemPage);
  }
  return pageItems.map(textOnlyPage);
}
