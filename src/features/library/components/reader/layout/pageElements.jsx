// LayoutPageViewer(실제 리더)와 PoemPreviewStep(제작 중 미리보기)이 공유하는
// "elements 배열 → 페이지 DOM" 렌더링 로직. 여기를 고치면 리더와 미리보기가 항상 같이 바뀐다.
import "./LayoutPageViewer.css";

export const PAGE_WIDTH = 480;
export const PAGE_HEIGHT = 620;

export const FONT_SCALE = { sm: 0.85, base: 1, lg: 1.2 };

export function sortElements(elements = []) {
  return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

export function renderElement(element, fontScale = 1, isEnglish = false) {
  if (element.type === "image") {
    return (
      <div
        key={element.id}
        className="layout-page-image"
        style={{
          left: element.x,
          top: element.y,
          width: element.w,
          height: element.h,
          borderRadius: `${element.radius || 0}px`,
          opacity: element.opacity ?? 1,
          zIndex: element.zIndex || 1,
        }}
      >
        <img
          src={element.src}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          style={{ objectFit: element.objectFit || "cover" }}
        />
      </div>
    );
  }

  if (element.type === "text") {
    // 기본은 그냥 위에서부터 자연스럽게 쌓이는 문서 흐름(block)이라, 제목+본문을 한 박스에
    // 같이 넣어도 순서대로 쌓인다. 본문은 textFitting.js가 책을 만들 때 이미 이 박스에
    // 맞게(넘치지 않게) 잘라 둔 상태라 넘칠 일이 없다. "제1편"처럼 짧은 텍스트를 박스
    // 정중앙에 두고 싶을 때만 verticalCenter:true로 flex 중앙정렬을 켠다. "safe"는 짧으면
    // 가운데로 오되, 혹시라도 내용이 박스보다 커지는 예외적인 경우에도 위쪽 기준으로
    // 잘리지 않게(safe center) 한다.
    const centerStyle = element.verticalCenter === "safe"
      ? { display: "flex", flexDirection: "column", justifyContent: "safe center" }
      : element.verticalCenter
        ? {
          display: "flex",
          alignItems: "center",
          justifyContent: element.align === "center" ? "center" : element.align === "right" ? "flex-end" : "flex-start",
        }
        : {};

    // 글자 크기(fontScale)를 키우면 박스 높이도 같이 키우되, y 위치는 그대로라서 무작정
    // 키우면 박스 아래쪽이 페이지(PAGE_HEIGHT) 밖으로 삐져나갈 수 있다. 이러면
    // verticalCenter:"safe" 같은 세로 가운데 정렬이 "삐져나간 부분까지 포함한 박스" 기준으로
    // 계산돼서 화면에 보이는 페이지 안에서는 아래로 쏠려 보인다. 페이지 바닥을 못 넘게 막는다.
    const scaledHeight = (element.h || 0) * fontScale;
    const maxHeight = Math.max(0, PAGE_HEIGHT - element.y - 10);
    const boxHeight = Math.min(scaledHeight, maxHeight);
    // 영어 번역이 기본 크기 박스에 안 들어가서 발행 시 글자 크기를 줄여 저장한 페이지는
    // (essayCreationService.js/poemCreationService.js 참고) 영어를 볼 때만 그 크기를 쓴다.
    // 잘라내는 대신 작게 보여줘서 내용이 항상 온전히 보이게 한다.
    const baseFontSize = (isEnglish && element.fontSizeEn) || element.fontSize || 17;

    return (
      <div
        key={element.id}
        className="layout-page-text"
        style={{
          left: element.x,
          top: element.y,
          width: element.w,
          height: boxHeight,
          fontSize: `${baseFontSize * fontScale}px`,
          lineHeight: element.lineHeight || 1.8,
          color: element.color || "#222222",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: element.align || "left",
          fontWeight: element.fontWeight || 500,
          fontFamily: element.fontFamily === "serif" ? "var(--font-serif)" : element.fontFamily === "sans" ? "var(--font-sans)" : undefined,
          opacity: element.opacity ?? 1,
          borderRadius: `${element.radius || 0}px`,
          zIndex: element.zIndex || 10,
          ...centerStyle,
        }}
        dangerouslySetInnerHTML={{ __html: (isEnglish ? element.htmlEn : element.htmlKo) ?? element.html }}
      />
    );
  }

  return null;
}

// 페이지 하나(elements 배열)를 480x620 캔버스 위에 그리는 최소 단위 컴포넌트.
// LayoutPageViewer는 이걸 react-pageflip 안에서 쓰고, PoemPreviewStep은 그냥 단독으로 쓴다.
export function PageCanvas({ page, fontScale = 1, isEnglish = false, className = "", style }) {
  return (
    <div
      className={`layout-flip-page ${className}`}
      style={{ backgroundColor: page.backgroundColor || "#ffffff", ...style }}
    >
      {sortElements(page.elements).map(el => renderElement(el, fontScale, isEnglish))}
    </div>
  );
}
