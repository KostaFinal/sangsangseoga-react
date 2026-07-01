import { ChevronLeft, Languages, Type, Bookmark, StickyNote } from "lucide-react";

export default function ReaderHeader({
  book,
  readerMode,
  onBack,
  onToggleBookmark,
  isEnglish,
  setIsEnglish,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  isMemoOpen,
  setIsMemoOpen,
}) {
  return (
    <header className="w-full bg-white border-b border-black/5 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 rounded-full transition-all text-black/70 hover:text-black cursor-pointer"
          id="reader-back-btn"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-serif text-lg font-bold text-black/90 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
          {book.title}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={() => setIsEnglish(!isEnglish)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium border transition-all cursor-pointer ${
            isEnglish ? "bg-black text-white border-black" : "bg-white hover:bg-black/5 border-black/10 text-black/60"
          }`}
          title="영문/국문 번역 전환"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs">{isEnglish ? "국문" : "영문"}</span>
        </button>

        <button
          onClick={() => {
            if (fontFamily === "serif") setFontFamily("sans");
            else if (fontFamily === "sans") setFontFamily("mono");
            else setFontFamily("serif");
          }}
          className="p-2 hover:bg-black/5 rounded-lg border border-black/10 text-black/60 hover:text-black flex items-center gap-1 transition cursor-pointer"
          title="서체 전환 (바탕체 / 고딕체 / 코딩체)"
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] font-bold font-sans">
            {fontFamily === "serif" ? "바탕체" : fontFamily === "sans" ? "고딕체" : "코딩체"}
          </span>
        </button>

        <button
          onClick={() => {
            if (fontSize === "sm") setFontSize("base");
            else if (fontSize === "base") setFontSize("lg");
            else setFontSize("sm");
          }}
          className="p-2 hover:bg-black/5 rounded-lg border border-black/10 text-black/60 hover:text-black text-xs font-bold transition flex items-center justify-center cursor-pointer"
          title="글자 크기 조절"
        >
          가<span className="text-[10px] font-sans ml-1 text-black/50">{fontSize === "sm" ? "작게" : fontSize === "base" ? "보통" : "크게"}</span>
        </button>

        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            book.isBookmarked ? "bg-amber-100 border-amber-300 text-amber-600" : "border-black/10 hover:bg-black/5 text-black/60"
          }`}
          title="내 서재 북마크 보관"
        >
          <Bookmark className={`w-4 h-4 ${book.isBookmarked ? "fill-amber-500" : ""}`} />
        </button>

        <button
          onClick={() => setIsMemoOpen(!isMemoOpen)}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isMemoOpen ? "bg-amber-100 border-amber-200 text-yellow-700" : "border-black/10 hover:bg-black/5 text-black/60"
          }`}
          title="사색 포스트잇 메모 켜기/끄기"
        >
          <StickyNote className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
