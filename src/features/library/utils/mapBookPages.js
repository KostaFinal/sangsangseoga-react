// 백엔드 BookPageDto 목록을 리더(LayoutPageViewer/FadePageViewer)가 기대하는
// { id, backgroundColor, elements } 형태로 변환한다.
// - FAIRY_TALE(동화): book_page가 이미지 행/글 행으로 이미 번갈아 저장돼 있다고 가정.
//   행에 imageUrl이 있으면 이미지만 있는 페이지, 없으면 글만 있는 페이지로 그대로 1:1 매핑.
// - 그 외 bookType(NOVEL/POEM/ESSAY/NONFICTION 등): 전부 글만 있는 페이지 (imageUrl은 사용 안 함)

const koText = (page) => page.contentTextKo || page.contentTextEn || "";
const enText = (page) => page.contentTextEn || page.contentTextKo || "";

function textOnlyPage(page) {
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
        htmlEn: page.title,
      }] : []),
      {
        id: `text-${page.pageNo}`,
        type: "text",
        x: 60, y: page.title ? 90 : 70, w: 360, h: 500,
        fontSize: 17, lineHeight: 1.85, fontFamily: "serif",
        htmlKo: koText(page),
        htmlEn: enText(page),
      },
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
  return pageItems.map(textOnlyPage);
}
