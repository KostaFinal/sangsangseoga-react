import { useState, useEffect } from "react";
import ReaderHeader from "./reader/ReaderHeader";
import MemoStickyNote from "./reader/MemoStickyNote";
import LastPageModal from "./reader/LastPageModal";
import CompletionScreen from "./reader/CompletionScreen";
import NovelReaderView from "./reader/NovelReaderView";
import PoetryReaderView from "./reader/PoetryReaderView";
import EssayReaderView from "./reader/EssayReaderView";
import FairytaleReaderView from "./reader/FairytaleReaderView";
import KnowledgeReaderView from "./reader/KnowledgeReaderView";

// 동화/시/소설/에세이/지식정보 — 5개 장르가 각자의 전용 뷰어를 씀.
function getReaderMode(genre) {
  if (genre === "동화") return "fairytale";
  if (genre === "시") return "poetry";
  if (genre === "에세이") return "essay";
  if (genre === "지식정보") return "knowledge";
  return "novel"; // 소설
}

const READER_COMPONENTS = {
  novel: NovelReaderView,
  poetry: PoetryReaderView,
  essay: EssayReaderView,
  fairytale: FairytaleReaderView,
  knowledge: KnowledgeReaderView,
};

export default function BookReaderView({ book, books = [], onBack, onToggleBookmark, onToggleLike, editable = false, onLayoutChange, onSelectRecommended }) {
  const readerMode = getReaderMode(book.genre);

  const [isEnglish, setIsEnglish] = useState(false);
  const [fontSize, setFontSize] = useState("base");
  const [fontFamily, setFontFamily] = useState("serif");
  const [isMemoOpen, setIsMemoOpen] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLastPageAlert, setShowLastPageAlert] = useState(false);
  const [currentPageKey, setCurrentPageKey] = useState(0);

  const [memos, setMemos] = useState({});

  useEffect(() => {
    setIsCompleted(false);
    setCurrentPageKey(0);
  }, [book.id]);

  useEffect(() => {
    const saved = localStorage.getItem(`sangsang_memos_${book.id}`);
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved memos", e);
      }
    } else {
      const defaultMemo = {
        0: "서서히 밝아오는 푸른 새벽빛과 은은한 책의 묵향이 아름답게 어우러지는 Prologue.",
        1: "기억을 사랑하는 마음, 너무 좋다.",
        2: "사유하는 마음의 끝에는 결국 깊은 구원과 아늑한 작별이 기다리고 있는 듯하다.",
      };
      setMemos(defaultMemo);
      localStorage.setItem(`sangsang_memos_${book.id}`, JSON.stringify(defaultMemo));
    }
  }, [book.id]);

  if (isCompleted) {
    return <CompletionScreen book={book} books={books} onBack={onBack} onReread={() => setIsCompleted(false)} onSelectRecommended={onSelectRecommended} />;
  }

  const ActiveReader = READER_COMPONENTS[readerMode];

  return (
    <div id="book-reader-root" className="w-full min-h-screen bg-white text-black flex flex-col font-sans select-none overflow-x-hidden relative transition-all duration-500">
      <ReaderHeader
        book={book}
        readerMode={readerMode}
        onBack={onBack}
        onToggleBookmark={onToggleBookmark}
        isEnglish={isEnglish}
        setIsEnglish={setIsEnglish}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isMemoOpen={isMemoOpen}
        setIsMemoOpen={setIsMemoOpen}
      />

      <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 px-4 md:px-12 relative max-w-7xl mx-auto w-full gap-6">
        <div className="relative w-full flex items-center justify-center">
          <ActiveReader
            book={book}
            isEnglish={isEnglish}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onComplete={() => setIsCompleted(true)}
            onLastPageBlocked={() => setShowLastPageAlert(true)}
            onPageChange={setCurrentPageKey}
            editable={editable}
            onLayoutChange={onLayoutChange}
          />

          <MemoStickyNote isOpen={isMemoOpen} bookId={book.id} pageKey={currentPageKey} memos={memos} setMemos={setMemos} />
        </div>
      </main>

      <LastPageModal show={showLastPageAlert} onClose={() => setShowLastPageAlert(false)} />
    </div>
  );
}
