import { useState, useEffect } from "react";
import LayoutPageViewer from "./layout/LayoutPageViewer";
import FadePageViewer from "./layout/FadePageViewer";


export default function NovelReaderView({ book, initialPageKey = 0, onComplete, onLastPageBlocked, onPageChange, viewType = "FLIP", fontSize = "base", isEnglish = false }) {
  const [currentIndex, setCurrentIndex] = useState(initialPageKey || 0);

  useEffect(() => {
    setCurrentIndex(initialPageKey || 0);
  }, [book.id, initialPageKey]);


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



