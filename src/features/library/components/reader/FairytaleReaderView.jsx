import { useState, useEffect } from "react";
import LayoutPageViewer from "./layout/LayoutPageViewer";
import FadePageViewer from "./layout/FadePageViewer";

export default function FairytaleReaderView({ book, onComplete, onLastPageBlocked, onPageChange, viewType = "FLIP", fontSize = "base", initialIndex = 0, isEnglish = false }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [book.id]);

  const Viewer = viewType === "FADE" ? FadePageViewer : LayoutPageViewer;

  return (
    <Viewer
      book={book}
      fontSize={fontSize}
      isEnglish={isEnglish}
      currentIndex={currentIndex}
      onIndexChange={idx => {
        setCurrentIndex(idx);
        onPageChange?.(idx);
      }}
      onComplete={onComplete}
      onLastPageBlocked={onLastPageBlocked}
    />
  );
}
