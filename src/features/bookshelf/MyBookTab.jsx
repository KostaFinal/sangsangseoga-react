import { useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { BOOK_GENRE_BADGE_CLASS } from '../../shared/utils/bookGenre';

const GENRES = ["전체", "소설", "시", "에세이", "동화"];

const GENRE_TYPE_MAP = {
  소설: "NOVEL",
  시: "POEM",
  에세이: "ESSAY",
  동화: "FAIRY_TALE",
};

export default function MyBookTab({
  filteredBooks,
  onOpenViewer,
  onDeleteBook,
  onOpenDetail,
}) {
  const [selectedGenre, setSelectedGenre] = useState("전체");

  const myBooks = filteredBooks
    .filter(book => book.isMyWrittenBook)
    .filter(book => {
      if (selectedGenre === "전체") {
        return true;
      }

      const selectedBookType = GENRE_TYPE_MAP[selectedGenre];

      return (
        book.bookType === selectedBookType ||
        book.genre === selectedBookType ||
        book.category === selectedGenre
      );
    });

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col gap-3 select-none header-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-navy-purple">
            내가 쓴 책
          </h3>

          <span className="px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
            {myBooks.length}권
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selectedGenre === genre
                  ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                  : "bg-white text-purple-gray-text border-lavender-border hover:border-brand-purple hover:text-brand-purple"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {myBooks.map(book => (
          <div
            key={book.id}
            id={`userbook-${book.id}`}
            className="bg-white rounded-2xl border border-lavender-border shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-brand-purple/50 transition-all h-[340px]"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={book.coverUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                alt={`${book.title} 표지`}
                referrerPolicy="no-referrer"
              />

              <span className="absolute top-2 left-2 bg-white text-navy-purple font-bold text-[9px] px-2.5 py-0.5 rounded-full border border-lavender-border shadow-sm">
                내가 쓴 책
              </span>
            </div>

            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className={BOOK_GENRE_BADGE_CLASS}>
                    {book.category}
                  </span>

                  {book.author && (
                    <span className="text-[9px] text-purple-gray-text font-semibold">
                      {book.author}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-navy-purple tracking-tight truncate mt-1.5">
                  {book.title}
                </h4>

                <p className="text-[10px] text-purple-gray-text mt-1 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onOpenDetail(book)}
                  className="px-3.5 py-2 bg-lavender-bg hover:bg-lavender-card text-brand-purple font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 border border-lavender-border"
                >
                  상세 & 수정 🔍
                </button>

                <button
                  type="button"
                  onClick={() => onOpenViewer(book.bookId || book.id)}
                  className="flex-grow py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  읽어보기
                  <ChevronRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `"${book.title}" 책을 삭제하시겠습니까?\n삭제 후 내가 쓴 책 목록에서 보이지 않습니다.`
                    );

                    if (!confirmed) return;

                    try {
                      await onDeleteBook(book.bookId || book.id);
                    } catch (error) {
                      console.error("책 삭제 실패", error);
                      alert("책 삭제에 실패했습니다.");
                    }
                  }}
                  className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-full cursor-pointer transition-all"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}

        {myBooks.length === 0 && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-lavender-border rounded-2xl bg-white max-w-lg mx-auto w-full select-none flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">
              {selectedGenre === "전체" ? "✒️" : "📚"}
            </span>

            <h5 className="font-plus font-bold text-sm text-navy-purple">
              {selectedGenre === "전체"
                ? "아직 상상 속에 봉인되어 있어요!"
                : `${selectedGenre} 장르의 책이 없어요.`}
            </h5>

            <p className="text-[10px] text-purple-gray-text max-w-[230px] leading-relaxed">
              {selectedGenre === "전체" ? (
                <>
                  우측 사이드바의{" "}
                  <Sparkles className="w-3.5 h-3.5 inline text-brand-purple" />{" "}
                  [독후감] 또는 위의 집필을 통해 나만의 새로운 도서를
                  창작해 보세요!
                </>
              ) : (
                "다른 장르를 선택하거나 새로운 책을 집필해 보세요."
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
