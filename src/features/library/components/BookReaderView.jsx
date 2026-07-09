import { useState, useEffect, useRef } from "react";
import { addBookmark, removeBookmark, getBookmarks } from "@/src/api/bookApi";
import { getViewerPreference, updateViewerPreference } from "@/src/api/memberApi";
import ReaderHeader from "./reader/ReaderHeader";
import MemoStickyNote from "./reader/MemoStickyNote";
import LastPageModal from "./reader/LastPageModal";
import CompletionScreen from "./reader/CompletionScreen";
import NovelReaderView from "./reader/NovelReaderView";
import PoetryReaderView from "./reader/PoetryReaderView";
import EssayReaderView from "./reader/EssayReaderView";
import FairytaleReaderView from "./reader/FairytaleReaderView";
import KnowledgeReaderView from "./reader/KnowledgeReaderView";

function getReaderMode(genre) {
  if (genre === "동화") return "fairytale";
  if (genre === "시") return "poetry";
  if (genre === "에세이") return "essay";
  return "novel";
}

const READER_COMPONENTS = {
  novel: NovelReaderView,
  poetry: PoetryReaderView,
  essay: EssayReaderView,
  fairytale: FairytaleReaderView,
  knowledge: KnowledgeReaderView,
};

const FONT_SIZE_TO_SERVER = { sm: "SMALL", base: "MEDIUM", lg: "LARGE" };
const FONT_SIZE_FROM_SERVER = { SMALL: "sm", MEDIUM: "base", LARGE: "lg" };

export default function BookReaderView({
  book,
  onBack,
  onToggleBookmark,
  onToggleLike,
  editable = false,
  onLayoutChange,
  onSelectRecommended,
  onProgressSave,
  onCompleteReading,
  onExploreLibrary
}) {
  const readerMode = getReaderMode(book.genre);

  const [isEnglish, setIsEnglish] = useState(false);
  const [fontSize, setFontSize] = useState("base");
  const [fontFamily, setFontFamily] = useState("serif");
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLastPageAlert, setShowLastPageAlert] = useState(false);
  const [currentPageKey, setCurrentPageKey] = useState(book.startPageIndex || 0);
  const [bookmarkedPages, setBookmarkedPages] = useState({});
  const [viewType, setViewType] = useState("FLIP");
  const readingStartTimeRef = useRef(Date.now());

  // 회원의 저장된 뷰어 환경설정(글자 크기/전환 방식)을 최초 진입 시 한 번 불러온다.
  useEffect(() => {
    getViewerPreference()
      .then(res => {
        const data = res.data?.data;
        if (data?.viewerFontSize) setFontSize(FONT_SIZE_FROM_SERVER[data.viewerFontSize] || "base");
        if (data?.viewerViewType) setViewType(data.viewerViewType);
      })
      .catch(() => { });
  }, []);

  const handleSetFontSize = (next) => {
    setFontSize(next);
    updateViewerPreference(FONT_SIZE_TO_SERVER[next], null).catch(err => console.error("글자 크기 저장 실패", err));
  };

  const handleSetViewType = (next) => {
    setViewType(next);
    updateViewerPreference(null, next).catch(err => console.error("페이지 전환 방식 저장 실패", err));
  };

  const handleTogglePageBookmark = async () => {
    const bookId = book.bookId || book.id;
    const wasBookmarked = !!bookmarkedPages[currentPageKey];
    setBookmarkedPages(prev => ({
      ...prev,
      [currentPageKey]: !wasBookmarked,
    }));
    try {
      if (wasBookmarked) {
        await removeBookmark(bookId, currentPageKey);
      } else {
        await addBookmark(bookId, currentPageKey);
      }
    } catch (err) {
      setBookmarkedPages(prev => ({
        ...prev,
        [currentPageKey]: wasBookmarked,
      }));
      console.error("북마크 처리 실패", err);
    }
  };

  const [memos, setMemos] = useState({});

  useEffect(() => {
    setIsCompleted(false);
    readingStartTimeRef.current = Date.now();

    const startPage = book.currentPage && book.currentPage > 0
      ? book.currentPage - 1
      : book.startPageIndex || 0;

    setCurrentPageKey(startPage);
    setMemos({});
  }, [book.id, book.currentPage, book.startPageIndex]);

  useEffect(() => {
    const bookId = book.bookId || book.id;
    if (!bookId) return;

    getBookmarks(bookId)
      .then(res => {
        const pages = res.data?.data || [];
        setBookmarkedPages(
          pages.reduce((acc, pageNo) => ({ ...acc, [pageNo]: true }), {})
        );
      })
      .catch(() => setBookmarkedPages({}));
  }, [book.id, book.bookId]);

  if (isCompleted) {
    return <CompletionScreen book={book} onBack={onBack} onSelectRecommended={onSelectRecommended} onExploreLibrary={onExploreLibrary} />;
  }

  const saveReadingTimeAndBack = async () => {
    if (onProgressSave) {
      const minutes = Math.floor(
        (Date.now() - readingStartTimeRef.current) / 1000 / 60
      );

      if (minutes > 0) {
        const totalPages = book.pages?.length || book.pageCount || 1;

        await onProgressSave(
          book.bookId || book.id,
          currentPageKey + 1,
          totalPages,
          minutes
        );
      }
    }

    onBack?.();
  };

  const ActiveReader = READER_COMPONENTS[readerMode];

  return (
    <div id="book-reader-root" className="w-full min-h-screen bg-white text-black flex flex-col font-sans select-none overflow-x-hidden relative transition-all duration-500">
      <ReaderHeader
        book={book}
        readerMode={readerMode}
        onBack={saveReadingTimeAndBack}
        onToggleBookmark={handleTogglePageBookmark}
        isEnglish={isEnglish}
        setIsEnglish={setIsEnglish}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={handleSetFontSize}
        isMemoOpen={isMemoOpen}
        setIsMemoOpen={setIsMemoOpen}
        isPageBookmarked={!!bookmarkedPages[currentPageKey]}
        viewType={viewType}
        setViewType={handleSetViewType}
      />

      <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 px-4 md:px-12 relative max-w-7xl mx-auto w-full gap-6">
        <div className="relative w-full flex items-center justify-center">
          <ActiveReader
            book={book}
            initialPageKey={currentPageKey}
            isEnglish={isEnglish}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onComplete={async () => {
              if (onCompleteReading) {
                await onCompleteReading(book.bookId || book.id);
              }
              setIsCompleted(true);
            }}
            onLastPageBlocked={() => setShowLastPageAlert(true)}
            onPageChange={async (pageKey) => {
              setCurrentPageKey(pageKey);
              setIsMemoOpen(false);

              if (onProgressSave) {
                const currentPage = pageKey + 1;
                const totalPages = book.pages?.length || book.pageCount || 1;
                await onProgressSave(book.bookId || book.id, currentPage, totalPages);
              }
            }}



            editable={editable}
            onLayoutChange={onLayoutChange}
            viewType={viewType}
          />

          {bookmarkedPages[currentPageKey] && (
            <div
              onClick={handleTogglePageBookmark}
              title="북마크 제거"
              style={{
                position: 'absolute',
                top: '20px',
                left: viewType === "FADE" ? 'calc(50% + 280px)' : 'calc(50% + 520px)',
                transform: 'translateX(-100%)',
                cursor: 'pointer',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#1e3a8a',
                boxShadow: '0 2px 8px rgba(30,58,138,0.4)',
              }} />
              <div style={{
                width: 0,
                height: 0,
                borderTop: '15px solid #1e3a8a',
                borderBottom: '15px solid #1e3a8a',
                borderRight: '8px solid transparent',
              }} />
            </div>
          )}

          <MemoStickyNote isOpen={isMemoOpen} bookId={book.id} pageKey={currentPageKey} memos={memos} setMemos={setMemos} />
        </div>
      </main>

      <LastPageModal show={showLastPageAlert} onClose={() => setShowLastPageAlert(false)} />
    </div>
  );
}
