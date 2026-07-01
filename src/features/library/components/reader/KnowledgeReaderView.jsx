import { useState, useEffect } from "react";
import LayoutPageViewer from "./layout/LayoutPageViewer";

export default function KnowledgeReaderView({ book, onComplete, onLastPageBlocked, onPageChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [book.id]);

  return (
    <LayoutPageViewer
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
