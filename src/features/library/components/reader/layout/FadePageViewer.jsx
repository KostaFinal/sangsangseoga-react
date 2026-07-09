import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "./FadePageViewer.css";

const PAGE_WIDTH = 480;
const PAGE_HEIGHT = 620;

const FONT_SCALE = { sm: 0.85, base: 1, lg: 1.2 };

function sortElements(elements = []) {
  return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

function renderElement(element, fontScale = 1, isEnglish = false) {
  if (element.type === "image") {
    return (
      <div
        key={element.id}
        className="fade-page-image"
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
        className="fade-page-text"
        style={{
          width: element.w,
          fontSize: `${(element.fontSize || 17) * fontScale}px`,
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
        dangerouslySetInnerHTML={{ __html: (isEnglish ? element.htmlEn : element.htmlKo) ?? element.html }}
      />
    );
  }

  return null;
}

/**
 * 한 페이지씩 페이드 전환으로 보여주는 뷰어 (FADE 모드)
 */
export default function FadePageViewer({
  book,
  currentIndex,
  onIndexChange,
  onComplete,
  onLastPageBlocked,
  fontSize = "base",
  isEnglish = false,
}) {
  const fontScale = FONT_SCALE[fontSize] ?? 1;
  const pages = Array.isArray(book.pages)
    ? book.pages
    : [
      {
        id: "page-empty",
        backgroundColor: "#ffffff",
        elements: [
          {
            id: "text-empty",
            type: "text",
            html: "본문을 불러오지 못했습니다.",
          }
        ]
      }
    ];
  const isLast = currentIndex >= pages.length - 1;
  const [direction, setDirection] = useState(1); // 1: 다음, -1: 이전

  // 마지막 페이지 도달 시 모달
  const prevIsLast = useRef(false);
  useEffect(() => {
    if (isLast && !prevIsLast.current) {
      prevIsLast.current = true;
      onLastPageBlocked?.();
    } else if (!isLast) {
      prevIsLast.current = false;
    }
  }, [isLast, onLastPageBlocked]);

  const goPrev = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    onIndexChange?.(currentIndex - 1);
  };

  const goNext = () => {
    if (isLast) return;
    setDirection(1);
    onIndexChange?.(currentIndex + 1);
  };

  const goToIndex = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    onIndexChange?.(idx);
  };

  const page = pages[currentIndex];

  return (
    <div className="fade-page-viewer">
      <button type="button" className="fade-page-arrow left" disabled={currentIndex === 0} onClick={goPrev}>
        <ChevronLeft size={22} />
      </button>

      <div className="fade-stage" style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fade-page"
            style={{
              backgroundColor: page?.backgroundColor || "#ffffff",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 48px',
              boxSizing: 'border-box',
            }}
          >
            {sortElements(page?.elements).map(el => renderElement(el, fontScale, isEnglish))}
          </motion.div>
        </AnimatePresence>
      </div>

      <button type="button" className="fade-page-arrow right" disabled={isLast} onClick={goNext}>
        <ChevronRight size={22} />
      </button>

      <div className="fade-page-footer">
        <div className="fade-page-dots">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className={idx === currentIndex ? "active" : ""}
              onClick={() => goToIndex(idx)}
            />
          ))}
        </div>
        <span className="fade-page-count">{currentIndex + 1} / {pages.length}</span>
        {isLast && (
          <button type="button" className="fade-page-complete-btn" onClick={onComplete}>
            <BookOpen size={13} />
            독서 마치기
          </button>
        )}
      </div>
    </div>
  );
}
