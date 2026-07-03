import { useState, useEffect } from "react";
import LayoutPageViewer from "./layout/LayoutPageViewer";
import FadePageViewer from "./layout/FadePageViewer";

export default function KnowledgeReaderView({ book, onComplete, onLastPageBlocked, onPageChange, viewType = "FLIP" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [book.id]);

  const Viewer = viewType === "FADE" ? FadePageViewer : LayoutPageViewer;

  return (
    <Viewer
      book={book}
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
