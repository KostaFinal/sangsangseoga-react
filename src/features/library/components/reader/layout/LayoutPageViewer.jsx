import { forwardRef, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./LayoutPageViewer.css";

const PAGE_WIDTH = 480;
const PAGE_HEIGHT = 620;

function sortElements(elements = []) {
  return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

function renderElement(element) {
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
    return (
      <div
        key={element.id}
        className="layout-page-text"
        style={{
          left: element.x,
          top: element.y,
          width: element.w,
          height: element.h,
          fontSize: `${element.fontSize || 17}px`,
          lineHeight: element.lineHeight || 1.8,
          color: element.color || "#222222",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: element.align || "left",
          fontWeight: element.fontWeight || 500,
          fontFamily: element.fontFamily === "serif" ? "var(--font-serif)" : element.fontFamily === "sans" ? "var(--font-sans)" : undefined,
          opacity: element.opacity ?? 1,
          borderRadius: `${element.radius || 0}px`,
          zIndex: element.zIndex || 10,
        }}
        dangerouslySetInnerHTML={{ __html: element.html }}
      />
    );
  }

  return null;
}

// react-pageflip은 페이지 엘리먼트에 ref가 꽂혀야 해서 forwardRef로 감싼다.
const FlipPage = forwardRef(({ page }, ref) => (
  <div className="layout-flip-page" ref={ref} style={{ backgroundColor: page.backgroundColor || "#ffffff" }}>
    {sortElements(page.elements).map(renderElement)}
  </div>
));

/**
 * 모든 장르(소설/시/에세이/지식정보/동화)가 공유하는 페이지 뷰어.
 * react-pageflip(StPageFlip)을 써서 실제 종이가 휘어지며 넘어가는 효과를 낸다.
 * 항상 두 페이지(왼쪽/오른쪽)가 펼쳐진 형태로 보여준다.
 */
export default function LayoutPageViewer({
  book,
  currentIndex,
  onIndexChange,
  onComplete,
  onLastPageBlocked,
}) {
  const pages = book.pages;
  const bookRef = useRef(null);
  const lastIndex = pages.length - 1;
  // usePortrait=false(항상 2페이지 펼침) 모드에서는 마지막으로 도달 가능한
  // getCurrentPageIndex()가 lastIndex가 아니라 "마지막 스프레드의 첫 페이지" 인덱스다.
  const lastReachableIndex = pages.length % 2 === 0 ? Math.max(0, pages.length - 2) : lastIndex;
  const isLast = currentIndex >= lastReachableIndex;

  const handleFlip = useCallback(
    e => {
      onIndexChange?.(e.data);
    },
    [onIndexChange]
  );

  const goPrev = () => {
    const api = bookRef.current?.pageFlip();
    if (!api || api.getCurrentPageIndex() === 0) return;
    api.flipPrev();
  };

  const goNext = () => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (api.getCurrentPageIndex() >= lastReachableIndex) {
      onLastPageBlocked?.();
      return;
    }
    api.flipNext();
  };

  const goToIndex = idx => {
    bookRef.current?.pageFlip()?.turnToPage(idx);
    onIndexChange?.(idx);
  };

  return (
    <div className="layout-page-viewer">
      <button type="button" className="layout-page-arrow left" disabled={currentIndex === 0} onClick={goPrev}>
        <ChevronLeft size={22} />
      </button>

      <div className="layout-flip-stage" style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT }}>
        <HTMLFlipBook
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          size="fixed"
          minWidth={300}
          maxWidth={PAGE_WIDTH}
          minHeight={390}
          maxHeight={PAGE_HEIGHT}
          showCover={false}
          usePortrait={false}
          drawShadow={true}
          flippingTime={1100}
          maxShadowOpacity={0.4}
          mobileScrollSupport={false}
          className="layout-flip-book"
          ref={bookRef}
          onFlip={handleFlip}
        >
          {pages.map(page => (
            <FlipPage key={page.id} page={page} />
          ))}
        </HTMLFlipBook>
      </div>

      <button type="button" className="layout-page-arrow right" disabled={isLast} onClick={goNext}>
        <ChevronRight size={22} />
      </button>

      <div className="layout-page-footer">
        <div className="reader-page-dots">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className={idx === currentIndex ? "active" : ""}
              onClick={() => goToIndex(idx)}
            />
          ))}
        </div>
        <span className="reader-page-count">{currentIndex + 1} / {pages.length}</span>
        {isLast && (
          <button type="button" className="layout-page-complete-btn" onClick={onComplete}>
            완독하기
          </button>
        )}
      </div>
    </div>
  );
}
