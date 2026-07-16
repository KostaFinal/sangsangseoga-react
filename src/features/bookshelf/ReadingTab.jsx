import React, { useState } from "react";
import { ChevronRight, StickyNote } from "lucide-react";

const GENRES = ["전체", "소설", "시", "에세이", "동화"];

export default function ReadingTab({
  filteredBooks,
  onOpenViewer,
  onOpenDetail,
  onOpenMemos,
}) {
  const [selectedGenre, setSelectedGenre] = useState("전체");

  // 실제 읽는 중 상태인 책만 표시
  const readingBooks = filteredBooks.filter(
    book => book.readingStatus === "READING"
  );

  const genreFilteredBooks =
    selectedGenre === "전체"
      ? readingBooks
      : readingBooks.filter(book => book.category === selectedGenre);

  const formatRecentReadDate = recentReadAt => {
    if (!recentReadAt) return "-";

    const date = new Date(recentReadAt);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-plus text-xl font-black text-navy-purple">
            읽고 있는 책
          </h3>

          <span className="px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
            {readingBooks.length}권
          </span>
        </div>
      </div>

      {/* 장르 필터 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 cursor-pointer ${selectedGenre === genre
              ? "bg-brand-purple text-white border-brand-purple shadow-sm shadow-brand-purple/20"
              : "bg-white text-purple-gray-text border-lavender-border hover:border-brand-purple/40 hover:text-brand-purple"
              }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {genreFilteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-lavender-border p-12 text-center text-purple-gray-text font-medium text-sm">
          이 카테고리에서 읽고 있는 책이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {genreFilteredBooks.map(book => (
            <div
              key={book.id}
              id={`readingbook-${book.id}`}
              onClick={() => onOpenDetail(book)}
              className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 flex flex-col justify-between h-[255px] hover:shadow-md hover:border-brand-purple/50 transition-all group cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-lavender-border shadow-sm">
                  <img
                    src={book.coverUrl || "/default-book-cover.png"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    alt="Cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-full">
                    {book.category}
                  </span>

                  <h4 className="font-plus font-bold text-sm text-navy-purple mt-1 truncate tracking-tight">
                    {book.title}
                  </h4>

                  <p className="text-[10px] text-purple-gray-text mt-0.5 truncate">
                    글쓴이: {book.author}
                  </p>

                  <p className="text-[9px] text-brand-purple font-medium mt-0.5">
                    최근 읽음: {formatRecentReadDate(book.recentReadAt)}
                  </p>

                  <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-md mt-1 inline-block">
                    진행 {book.currentPage || 1} / {book.pageCount || 1}쪽
                  </span>
                </div>
              </div>

              {/* 진행률 */}
              <div className="space-y-1.5 mt-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-purple-gray-text">
                  <span>독서 진행률</span>
                  <span className="text-navy-purple font-plus">
                    {Number(book.progress) || 0}%
                  </span>
                </div>

                <div className="w-full h-2 bg-lavender-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-purple rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(book.progress) || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    onOpenMemos(book);
                  }}
                  className="flex-1 py-2 bg-white hover:bg-lavender-bg text-brand-purple font-bold text-xs rounded-full border border-lavender-border transition-all flex items-center justify-center gap-1"
                >
                  <StickyNote className="w-3 h-3" />
                  메모 목록
                </button>

                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    onOpenViewer(book.id);
                  }}
                  id={`resume-read-${book.id}`}
                  className="flex-1 py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  이어 읽기
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}