import { useState, useEffect, useRef } from "react";
import { addBookmark, removeBookmark, getBookmark } from "@/src/api/bookApi";
import { getViewerPreference, updateViewerPreference } from "@/src/api/memberApi";
import ReaderHeader from "./reader/ReaderHeader";
import MemoStickyNote from "./reader/MemoStickyNote";
import LastPageModal from "./reader/LastPageModal";
import CompletionScreen from "./reader/CompletionScreen";
import NovelReaderView from "./reader/NovelReaderView";
import PoetryReaderView from "./reader/PoetryReaderView";
import EssayReaderView from "./reader/EssayReaderView";
import FairytaleReaderView from "./reader/FairytaleReaderView";
import ExitBookmarkModal from "./ExitBookmarkModal";

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
};

const FONT_SIZE_TO_SERVER = { sm: "SMALL", base: "MEDIUM", lg: "LARGE" };
const FONT_SIZE_FROM_SERVER = { SMALL: "sm", MEDIUM: "base", LARGE: "lg" };

export default function BookReaderView({
  book,
  onBack,
  editable = false,
  onLayoutChange,
  onSelectRecommended,
  onProgressSave,
  onReadingBookmarkSave,
  onReadingTimeSave,
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
  // 책 한 권당 북마크는 하나뿐 - 현재 북마크가 꽂혀 있는 페이지 번호(없으면 null)
  const [bookmarkedPage, setBookmarkedPage] = useState(null);
  const [savedBookmarkPageNo, setSavedBookmarkPageNo] = useState(null);
  const [showExitBookmarkModal, setShowExitBookmarkModal] = useState(false);
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [viewType, setViewType] = useState("FLIP");
  const readingStartTimeRef = useRef(Date.now());
  const hasSavedBookmark = savedBookmarkPageNo != null;


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

  const handleToggleBookmark = async () => {
    const bookId = book.bookId || book.id;
    const wasCurrentPageBookmarked = bookmarkedPage === currentPageKey;
    const previousBookmarkedPage = bookmarkedPage;
    const previousSavedBookmarkPageNo = savedBookmarkPageNo;
    const nextBookmarkedPage = wasCurrentPageBookmarked ? null : currentPageKey;

    setBookmarkedPage(nextBookmarkedPage);
    setSavedBookmarkPageNo(nextBookmarkedPage != null ? nextBookmarkedPage + 1 : null);

    try {
      if (wasCurrentPageBookmarked) {
        await removeBookmark(bookId);
      } else {
        // 책당 북마크가 하나뿐이라, 다른 페이지에 있던 북마크는 현재 페이지로 옮겨진다.
        // 이어읽기 위치 갱신(onProgressSave)은 여기서 같이 하지 않는다 - 그걸 부르면
        // MyLibraryLayout의 books state가 바뀌면서 리더를 여는 useEffect가 다시 돌고,
        // <BookReaderView key={...startPageIndex}>의 key가 바뀌어 읽는 도중에 리더 전체가
        // 리마운트돼 버린다(요청이 겹쳐 "이미 북마크됨" 에러까지 났다). 이어읽기 위치를
        // 북마크와 맞추는 건 나갈 때(ExitBookmarkModal/handleKeepBookmarkAndExit)만 한다.
        // pageNo는 1-index(다른 곳의 currentPage/savedBookmarkPageNo와 동일 규칙) - currentPageKey는
        // 0-index라 그대로 보내면 한 페이지 앞으로 저장되는 버그가 있었다.
        await addBookmark(bookId, currentPageKey + 1);
      }
    } catch (err) {
      setBookmarkedPage(previousBookmarkedPage);
      setSavedBookmarkPageNo(previousSavedBookmarkPageNo);
      console.error("북마크 처리 실패", err);
    }
  };

  const [memos, setMemos] = useState({});

  useEffect(() => {
    setIsCompleted(false);
    readingStartTimeRef.current = Date.now();

    const startPage =
      book.startPageIndex != null
        ? book.startPageIndex
        : book.currentPage && book.currentPage > 0
          ? book.currentPage - 1
          : 0;

    setCurrentPageKey(startPage);
    setMemos({});
  }, [book.id, book.currentPage, book.startPageIndex]);

  useEffect(() => {
    const bookId = book.bookId || book.id;
    if (!bookId) return;

    let cancelled = false;

    getBookmark(bookId)
      .then(res => {
        if (cancelled) return;

        // 책당 북마크는 하나뿐이라 단일 객체로 온다: { pageNo, isBookmarkedByMe }.
        const bookmark = res.data?.data;
        const savedPage = bookmark?.isBookmarkedByMe ? Number(bookmark.pageNo) : null;
        const validSavedPage = Number.isInteger(savedPage) && savedPage > 0 ? savedPage : null;

        setSavedBookmarkPageNo(validSavedPage);
        // 헤더의 북마크 아이콘(isPageBookmarked)도 서버에 저장된 북마크로 맞춘다 -
        // 안 그러면 책을 다시 열었을 때 실제로는 북마크돼 있어도 아이콘이 꺼져 보인다.
        // currentPageKey는 0-index, pageNo는 1-index라 하나 빼서 맞춘다.
        setBookmarkedPage(validSavedPage != null ? validSavedPage - 1 : null);
      })
      .catch(err => {
        if (cancelled) return;

        console.error("책갈피 조회 실패", err);
        setSavedBookmarkPageNo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [book.id, book.bookId]);

  if (isCompleted) {
    return <CompletionScreen book={book} onBack={onBack} onSelectRecommended={onSelectRecommended} onExploreLibrary={onExploreLibrary} />;
  }

  const ActiveReader = READER_COMPONENTS[readerMode];

  const handleRequestExit = () => {
    setShowExitBookmarkModal(true);
  };

  const handleContinueReading = () => {
    if (isSavingBookmark) return;
    setShowExitBookmarkModal(false);
  };

  const handleKeepBookmarkAndExit = async () => {
    if (!hasSavedBookmark || isSavingBookmark) return;

    const bookId = book.bookId || book.id;
    const bookmarkPage = savedBookmarkPageNo;

    const totalPages = Math.max(
      1,
      book.pages?.length || book.pageCount || 1
    );

    const minutes = Math.max(
      0,
      Math.floor(
        (Date.now() - readingStartTimeRef.current) / 1000 / 60
      )
    );

    try {
      setIsSavingBookmark(true);

      if (onProgressSave) {
        await onProgressSave(
          bookId,
          bookmarkPage,
          totalPages,
          minutes
        );
      }

      setShowExitBookmarkModal(false);
      onBack?.();
    } catch (err) {
      console.error("기존 북마크 위치 저장 실패", err);
      alert("읽던 위치를 저장하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingBookmark(false);
    }
  };

  const handleSaveBookmarkAndExit = async () => {
    if (isSavingBookmark) return;

    const bookId = book.bookId || book.id;
    const currentPage = currentPageKey + 1;
    const totalPages = Math.max(
      1,
      book.pages?.length || book.pageCount || 1
    );

    const minutes = Math.max(
      0,
      Math.floor(
        (Date.now() - readingStartTimeRef.current) / 1000 / 60
      )
    );

    try {
      setIsSavingBookmark(true);

      // 현재 API가 다중 책갈피 구조이므로 기존 책갈피를 제거합니다.
      if (onReadingBookmarkSave) {
        await onReadingBookmarkSave(
          bookId,
          currentPage,
          totalPages,
          minutes
        );
      }

      setSavedBookmarkPageNo(currentPage);
      setShowExitBookmarkModal(false);
      onBack?.();
    } catch (err) {
      console.error("이어 읽기 책갈피 저장 실패", err);
      alert("책갈피 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingBookmark(false);
    }
  };

  return (
    <div id="book-reader-root" className="w-full min-h-screen bg-white text-black flex flex-col font-sans select-none overflow-x-hidden relative transition-all duration-500">
      <ReaderHeader
        book={book}
        readerMode={readerMode}
        onBack={handleRequestExit}
        onToggleBookmark={handleToggleBookmark}
        isEnglish={isEnglish}
        setIsEnglish={setIsEnglish}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={handleSetFontSize}
        isMemoOpen={isMemoOpen}
        setIsMemoOpen={setIsMemoOpen}
        isPageBookmarked={bookmarkedPage === currentPageKey}
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
              if (isSavingBookmark) return;

              const bookId = book.bookId || book.id;

              const minutes = Math.max(
                0,
                Math.floor(
                  (Date.now() - readingStartTimeRef.current) / 1000 / 60
                )
              );

              try {
                setIsSavingBookmark(true);

                if (minutes > 0 && onReadingTimeSave) {
                  await onReadingTimeSave(bookId, minutes);
                }

                if (onCompleteReading) {
                  await onCompleteReading(bookId);
                }

                setIsCompleted(true);
              } catch (err) {
                console.error("완독 처리 실패", err);
                alert("독서 완료 처리에 실패했습니다.");
              } finally {
                setIsSavingBookmark(false);
              }
            }}
            onLastPageBlocked={() => setShowLastPageAlert(true)}
            onPageChange={(pageKey) => {
              setCurrentPageKey(pageKey);
              setIsMemoOpen(false);
            }}



            editable={editable}
            onLayoutChange={onLayoutChange}
            viewType={viewType}
          />

          {savedBookmarkPageNo === currentPageKey + 1 && (
            <div
              title={`이어 읽기 책갈피: ${savedBookmarkPageNo}페이지`}
              className="pointer-events-none absolute z-30 flex items-start"
              style={{
                top: "20px",
                left:
                  viewType === "FADE"
                    ? "calc(50% + 280px)"
                    : "calc(50% + 520px)",
                transform: "translateX(-100%)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "30px",
                  backgroundColor: "#1e3a8a",
                  boxShadow: "0 2px 8px rgba(30, 58, 138, 0.4)",
                }}
              />

              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "15px solid #1e3a8a",
                  borderBottom: "15px solid #1e3a8a",
                  borderRight: "8px solid transparent",
                }}
              />
            </div>
          )}

          <MemoStickyNote
            isOpen={isMemoOpen}
            bookId={book.bookId || book.id}
            pageKey={currentPageKey}
            memos={memos}
            setMemos={setMemos}
            onMemoExistenceChange={setIsMemoOpen}
          />
        </div>
      </main>

      <LastPageModal show={showLastPageAlert} onClose={() => setShowLastPageAlert(false)} />
      <ExitBookmarkModal
        show={showExitBookmarkModal}
        hasBookmark={hasSavedBookmark}
        currentPage={currentPageKey + 1}
        savedPage={savedBookmarkPageNo}
        saving={isSavingBookmark}
        onContinueReading={handleContinueReading}
        onKeepAndExit={handleKeepBookmarkAndExit}
        onSaveAndExit={handleSaveBookmarkAndExit}
      />
    </div>
  );
}
