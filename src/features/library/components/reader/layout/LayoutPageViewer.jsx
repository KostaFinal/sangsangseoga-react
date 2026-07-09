import { forwardRef, useRef, useCallback, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
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
  const rawPages = Array.isArray(book.pages)
    ? book.pages
    : [
      {
        id: "page-empty",
        backgroundColor: "#ffffff",
        elements: [
          {
            id: "text-empty",
            type: "text",
            x: 60,
            y: 100,
            w: 360,
            h: 300,
            html: "본문을 불러오지 못했습니다. 읽는 중 목록에서 다시 열어주세요.",
            fontSize: 18
          }
        ]
      }
    ];
  // react-pageflip은 페이지가 짝수여야 마지막 스프레드 에러가 안 남
  const pages = rawPages.length % 2 !== 0
    ? [...rawPages, { id: '__blank__', elements: [], backgroundColor: '#ffffff' }]
    : rawPages;

  const bookRef = useRef(null);
  const initializedRef = useRef(false);
  const lastReachableIndex = rawPages.length % 2 === 0
    ? Math.max(0, rawPages.length - 2)
    : rawPages.length - 1;
  const isLast = currentIndex >= lastReachableIndex;

  useEffect(() => {
    initializedRef.current = false;
  }, [book.id]);

  useEffect(() => {
    if (initializedRef.current) return;

    const timer = setTimeout(() => {
      const api = bookRef.current?.pageFlip();
      if (!api) return;

      const safeIdx = Math.min(currentIndex || 0, lastReachableIndex);
      api.turnToPage(safeIdx);
      initializedRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [book.id, currentIndex, lastReachableIndex]);

  // 마지막 페이지 도달 시 모달 - 렌더링 중 setState 방지를 위해 useEffect 사용
  const prevIsLast = useRef(false);
  useEffect(() => {
    if (isLast && !prevIsLast.current) {
      prevIsLast.current = true;
      onLastPageBlocked?.();
    } else if (!isLast) {
      prevIsLast.current = false;
    }
  }, [isLast, onLastPageBlocked]);

  const handleFlip = useCallback(
    e => {
      const idx = e.data;
      // 빈 페이지(짝수 맞추기용)로 넘어가지 않도록 lastReachableIndex로 제한
      const safeIdx = Math.min(idx, lastReachableIndex);
      onIndexChange?.(safeIdx);
      if (safeIdx !== idx) {
        bookRef.current?.pageFlip()?.turnToPage(lastReachableIndex);
      }
    },
    [onIndexChange, lastReachableIndex]
  );

  const goPrev = () => {
    const api = bookRef.current?.pageFlip();
    if (!api || currentIndex === 0) return;
    api.flipPrev();
  };

  const goNext = () => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (currentIndex >= lastReachableIndex) {
      onLastPageBlocked?.();
      return;
    }
    api.flipNext();
  };

  const goToIndex = idx => {
    const safeIdx = Math.min(idx, lastReachableIndex);
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    api.turnToPage(safeIdx);
    onIndexChange?.(safeIdx);
  };

  return (
    <div className="layout-page-viewer">
      <button type="button" className="layout-page-arrow left" disabled={currentIndex === 0} onClick={goPrev}>
        <ChevronLeft size={22} />
      </button>

      <div className="layout-flip-stage" style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT, position: 'relative' }}>
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
          swipeDistance={30}
          className="layout-flip-book"
          ref={bookRef}
          onFlip={handleFlip}
        >
          {pages.map(page => (
            <FlipPage key={page.id} page={page} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* 가운데 바인딩 선 - layout-flip-stage 밖에 위치해야 overflow hidden에 안 잘림 */}
      <div className="layout-binding-shadow" style={{ height: PAGE_HEIGHT }} />

      <button type="button" className="layout-page-arrow right" disabled={isLast} onClick={goNext}>
        <ChevronRight size={22} />
      </button>

      <div className="layout-page-footer">
        <div className="reader-page-dots">
          {rawPages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className={idx === currentIndex ? "active" : ""}
              onClick={() => goToIndex(idx)}
            />
          ))}
        </div>
        <span className="reader-page-count">{currentIndex + 1} / {rawPages.length}</span>
        {isLast && (
          <button type="button" className="layout-page-complete-btn" onClick={onComplete}>
            <BookOpen size={13} />
            독서 마치기
          </button>
        )}
      </div>
    </div>
  );
}
