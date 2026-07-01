import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import {
  ELEMENT_TYPES,
  PAGE_TYPES,
} from "../data/editorTemplates";

function sortElements(elements = []) {
  return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

function getBodyPageNumber(pages, pageIndex) {
  return pages
    .slice(0, pageIndex + 1)
    .filter((page) => page.pageType !== PAGE_TYPES.COVER).length;
}

function getBodyPageCount(pages) {
  return pages.filter((page) => page.pageType !== PAGE_TYPES.COVER).length;
}

export default function LayoutPreviewModal({ pages, initialIndex = 0, onClose }) {
  const [previewIndex, setPreviewIndex] = useState(initialIndex);

  const page = pages[previewIndex];
  const bodyPageCount = getBodyPageCount(pages);
  const bodyPageNumber =
    page.pageType === PAGE_TYPES.COVER
      ? 0
      : getBodyPageNumber(pages, previewIndex);

  const goPrev = useCallback(() => {
    setPreviewIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setPreviewIndex((prev) => Math.min(pages.length - 1, prev + 1));
  }, [pages.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goPrev, goNext, onClose]);

  const renderPreviewElement = (element) => {
    if (element.type === ELEMENT_TYPES.IMAGE) {
      return (
        <div
          key={element.id}
          className="layout-preview-image"
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
            style={{
              objectFit: element.objectFit || "cover",
            }}
          />
        </div>
      );
    }

    if (element.type === ELEMENT_TYPES.TEXT) {
      return (
        <div
          key={element.id}
          className="layout-preview-text"
          style={{
            left: element.x,
            top: element.y,
            width: element.w,
            height: element.h,
            fontSize: `${element.fontSize || 20}px`,
            lineHeight: element.lineHeight || 1.6,
            color: element.color || "#222222",
            backgroundColor: element.backgroundColor || "transparent",
            textAlign: element.align || "left",
            fontWeight: element.fontWeight || 500,
            opacity: element.opacity ?? 1,
            zIndex: element.zIndex || 10,
          }}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );
    }

    return null;
  };

  return (
    <div className="layout-preview-backdrop" onMouseDown={onClose}>
      <div
        className="layout-preview-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="layout-preview-header">
          <div>
            <h3>미리보기</h3>
            <p>
              {page.pageType === PAGE_TYPES.COVER
                ? "표지"
                : `${bodyPageNumber} / ${bodyPageCount} 페이지`}
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="layout-preview-body">
          <button
            type="button"
            className="layout-preview-arrow left"
            disabled={previewIndex === 0}
            onClick={goPrev}
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="layout-preview-page"
            style={{
              backgroundColor: page.backgroundColor || "#ffffff",
            }}
          >
            {sortElements(page.elements).map(renderPreviewElement)}
          </div>

          <button
            type="button"
            className="layout-preview-arrow right"
            disabled={previewIndex === pages.length - 1}
            onClick={goNext}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="layout-preview-footer">
          <div className="layout-preview-dots">
            {pages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === previewIndex ? "active" : ""}
                onClick={() => setPreviewIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

