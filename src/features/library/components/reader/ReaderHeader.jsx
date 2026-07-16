import { Bookmark, ChevronLeft, Languages, StickyNote } from "lucide-react";

export default function ReaderHeader({
  book,
  readerMode,
  onBack,
  onToggleBookmark,
  isPageBookmarked,
  isEnglish,
  setIsEnglish,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  isMemoOpen,
  setIsMemoOpen,
  viewType,
  setViewType,
}) {
  return (
    <header className="w-full bg-white border-b-2 border-black/10 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 rounded-full transition-all text-black cursor-pointer"
          id="reader-back-btn"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-gowun text-lg font-bold text-black truncate max-w-[200px] sm:max-w-xs md:max-w-md">
          {book.title}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-5">

        {/* 페이지 전환 방식 토글 - 영문 버튼 왼쪽 */}
        <button
          onClick={() => setViewType(viewType === "FLIP" ? "FADE" : "FLIP")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-gowun font-bold border transition-all cursor-pointer bg-white hover:bg-black/5 border-black/10 text-black"
          title="페이지 전환 방식 변경"
        >
          {viewType === "FLIP" ? "두 페이지" : "한 페이지"}
        </button>

        <button
          onClick={() => setIsEnglish(!isEnglish)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-gowun font-bold border transition-all cursor-pointer ${
            isEnglish
              ? "bg-[#6b54e7] border-[#6b54e7] text-white hover:bg-[#5f47d6]"
              : "bg-white hover:bg-black/5 border-black/10 text-black"
          }`}
          title="영문/국문 번역 전환"
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm">{isEnglish ? "영문" : "국문"}</span>
        </button>

        <button
          onClick={() => {
            if (fontSize === "sm") setFontSize("base");
            else if (fontSize === "base") setFontSize("lg");
            else setFontSize("sm");
          }}
          className={`p-2 rounded-lg border text-sm font-bold transition flex items-center justify-center cursor-pointer ${
            fontSize === "base"
              ? "bg-white hover:bg-black/5 border-black/10 text-black"
              : "bg-[#6b54e7] border-[#6b54e7] text-white hover:bg-[#5f47d6]"
          }`}
          title="글자 크기 조절"
        >
          가<span className={`text-xs font-gowun font-bold ml-1 ${fontSize === "base" ? "text-black/90" : "text-white"}`}>{fontSize === "sm" ? "작게" : fontSize === "base" ? "보통" : "크게"}</span>
        </button>

        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isPageBookmarked ? "bg-[#6b54e7] border-[#6b54e7] text-white hover:bg-[#5f47d6]" : "border-black/10 hover:bg-black/5 text-black/95"
          }`}
          title="이 페이지 북마크"
        >
          <Bookmark className="w-4 h-4" fill={isPageBookmarked ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => setIsMemoOpen(!isMemoOpen)}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isMemoOpen ? "bg-amber-100 border-amber-200 text-yellow-700" : "border-black/10 hover:bg-black/5 text-black/95"
          }`}
          title="사색 포스트잇 메모 켜기/끄기"
        >
          <StickyNote className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
